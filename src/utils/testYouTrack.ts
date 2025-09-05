import { youTrackService } from '../services/youtrack'

export async function testYouTrackConnection() {
  console.log('Testing YouTrack connection...')
  
  try {
    const response = await youTrackService.getCurrentSprintIssues()
    
    if (response.error) {
      console.error('❌ YouTrack connection failed:', response.error)
      return false
    }
    
    if (response.data) {
      console.log('✅ YouTrack connection successful!')
      console.log(`📊 Found ${response.data.length} issues in current sprint`)
      console.log('📋 Sample data:', response.data.slice(0, 2))
      return true
    }
    
    console.log('⚠️ No data returned from YouTrack')
    return false
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// Test function that can be called from browser console
if (typeof window !== 'undefined') {
  (window as any).testYouTrack = testYouTrackConnection
}
