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

// TEMPORARY: Function to count Done tasks with Automation tag
async function countDoneAutomationTasks() {
  try {
    console.log('🔍 Counting Done tasks with Automation tag in ATOP project...')
    const response = await youTrackService.getDoneAutomationTasksCount()
    
    if (response.error) {
      console.error('❌ Error:', response.error)
      return
    }
    
    if (response.data && Array.isArray(response.data)) {
      console.log(`✅ Found ${response.data.length} Done tasks with Automation tag`)
      console.log('📋 Task details:')
      response.data.forEach((task, index) => {
        console.log(`${index + 1}. ${task.idReadable}: ${task.summary}`)
        console.log(`   State: ${task.state.name}`)
        console.log(`   Tags: ${task.tags?.map(tag => tag.name).join(', ') || 'None'}`)
      })
      return response.data.length
    } else {
      console.log('❌ No data returned')
      return 0
    }
  } catch (error) {
    console.error('❌ Failed to count tasks:', error)
    return 0
  }
}

// Test functions that can be called from browser console
if (typeof window !== 'undefined') {
  (window as any).testYouTrack = testYouTrackConnection
  (window as any).countDoneAutomationTasks = countDoneAutomationTasks
}
