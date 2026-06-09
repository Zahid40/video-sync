import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Protect /auth/callback next redirect
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`)
    }
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User not found in callback:', userError)
      return NextResponse.redirect(`${origin}/auth/login`)
    }

    // 1. Check if profiles row exists, if not create it
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Error querying profiles:', profileError)
    }

    if (!profile) {
      // Get display name from user metadata or construct from email
      const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'
      const { error: insertProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: displayName,
          email: user.email || null,
          updated_at: new Date().toISOString(),
        })
      if (insertProfileError) {
        console.error('Error auto-creating profile:', insertProfileError)
      }
    }

    // 2. Check if product_memberships row exists for product slug = 'video-sync'
    // First, find the product ID for slug 'video-sync'
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('slug', 'video-sync')
      .maybeSingle()

    if (productError) {
      console.error('Error finding product:', productError)
    }

    let productId = product?.id
    if (!productId) {
      // If product doesn't exist, create it (in case it wasn't pre-registered in Supabase)
      const { data: newProduct, error: insertProductError } = await supabase
        .from('products')
        .insert({
          slug: 'video-sync',
          name: 'Video Sync',
        })
        .select('id')
        .single()

      if (insertProductError) {
        console.error('Error auto-creating product:', insertProductError)
      } else {
        productId = newProduct.id
      }
    }

    if (productId) {
      const { data: membership, error: membershipError } = await supabase
        .from('product_memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle()

      if (membershipError) {
        console.error('Error querying membership:', membershipError)
      }

      if (!membership) {
        const { error: insertMembershipError } = await supabase
          .from('product_memberships')
          .insert({
            user_id: user.id,
            product_id: productId,
            role: 'member',
            status: 'active',
          })
        if (insertMembershipError) {
          console.error('Error creating product membership:', insertMembershipError)
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error during callback provisioning:', err)
  }

  // Redirect to next or home
  return NextResponse.redirect(`${origin}${next}`)
}
