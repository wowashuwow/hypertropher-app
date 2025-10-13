import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

/**
 * Migration API: Move existing dish photos from bucket root to {user_id}/ folders
 * 
 * This endpoint:
 * 1. Queries all dishes with photos not in user ID folders
 * 2. For each dish, copies the photo to {user_id}/{filename}
 * 3. Updates the dish's image_url
 * 4. Deletes the old photo
 * 
 * Run this ONCE after deploying the new upload code
 */

export async function POST(request: Request) {
  try {
    // Use service client to bypass RLS
    const supabase = createServiceClient()
    
    console.log('🔄 Starting dish photos migration...')
    
    // Get all dishes with photos that need migration
    // Legacy photos are in bucket root (filename only) or dish-images/ folder
    const { data: dishes, error: queryError } = await supabase
      .from('dishes')
      .select('id, user_id, image_url')
      .not('image_url', 'is', null)
      .order('created_at', { ascending: true })
    
    if (queryError) {
      console.error('❌ Error querying dishes:', queryError)
      return NextResponse.json({ error: 'Failed to query dishes', details: queryError }, { status: 500 })
    }
    
    if (!dishes || dishes.length === 0) {
      return NextResponse.json({ message: 'No dishes found to migrate' })
    }
    
    console.log(`📊 Found ${dishes.length} dishes with photos`)
    
    const results = {
      total: dishes.length,
      migrated: 0,
      skipped: 0,
      failed: 0,
      errors: [] as any[]
    }
    
    // Process each dish
    for (const dish of dishes) {
      try {
        const { id, user_id, image_url } = dish
        
        // Extract filename from URL
        const urlMatch = image_url.match(/\/storage\/v1\/object\/public\/dish-photos\/(.+)$/)
        if (!urlMatch || !urlMatch[1]) {
          console.warn(`⚠️ Could not parse URL for dish ${id}`)
          results.skipped++
          continue
        }
        
        const oldPath = urlMatch[1] // e.g., "1760180575803-uhrkbd-file.jpg" or "dish-images/file.jpg"
        
        // Check if already in user ID folder format
        if (oldPath.startsWith(`${user_id}/`)) {
          console.log(`✅ Dish ${id} already migrated, skipping`)
          results.skipped++
          continue
        }
        
        // Extract just the filename (remove dish-images/ if present)
        const filename = oldPath.replace(/^dish-images\//, '')
        const newPath = `${user_id}/${filename}`
        
        console.log(`🔄 Migrating dish ${id}: ${oldPath} → ${newPath}`)
        
        // Step 1: Download file from old location
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('dish-photos')
          .download(oldPath)
        
        if (downloadError || !fileData) {
          console.error(`❌ Failed to download file for dish ${id}:`, downloadError)
          results.errors.push({ dish_id: id, step: 'download', error: downloadError })
          results.failed++
          continue
        }
        
        console.log(`✅ Downloaded file for dish ${id}`)
        
        // Step 2: Upload to new location with correct owner
        const { error: uploadError } = await supabase.storage
          .from('dish-photos')
          .upload(newPath, fileData, {
            contentType: fileData.type,
            cacheControl: '3600',
            upsert: false
          })
        
        if (uploadError) {
          console.error(`❌ Failed to upload file for dish ${id}:`, uploadError)
          results.errors.push({ dish_id: id, step: 'upload', error: uploadError })
          results.failed++
          continue
        }
        
        console.log(`✅ Uploaded file for dish ${id} with owner ${user_id}`)
        
        // Step 2: Update dish image_url in database
        const newUrl = image_url.replace(oldPath, newPath)
        const { error: updateError } = await supabase
          .from('dishes')
          .update({ image_url: newUrl })
          .eq('id', id)
        
        if (updateError) {
          console.error(`❌ Failed to update URL for dish ${id}:`, updateError)
          results.errors.push({ dish_id: id, step: 'update', error: updateError })
          results.failed++
          // Try to delete the copied file to avoid orphans
          await supabase.storage.from('dish-photos').remove([newPath])
          continue
        }
        
        console.log(`✅ Updated database for dish ${id}`)
        
        // Step 3: Delete old file
        const { error: deleteError } = await supabase.storage
          .from('dish-photos')
          .remove([oldPath])
        
        if (deleteError) {
          console.warn(`⚠️ Failed to delete old file for dish ${id}:`, deleteError)
          results.errors.push({ dish_id: id, step: 'delete', error: deleteError })
          // Don't increment failed - migration succeeded, just cleanup failed
        }
        
        console.log(`✅ Deleted old file for dish ${id}`)
        results.migrated++
        
      } catch (error) {
        console.error(`❌ Unexpected error migrating dish ${dish.id}:`, error)
        results.errors.push({ dish_id: dish.id, step: 'unexpected', error })
        results.failed++
      }
    }
    
    console.log('🎉 Migration complete!', results)
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

