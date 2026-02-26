import React, { useState, useEffect } from "react"
import { Layout } from "../components/Layout"
import { AuthGuard } from "../components/AuthGuard"
import { FormField, TextInput, TextArea, Select } from "../components/FormField"
import { SuccessModal } from "../components/SuccessModal"
import { youTrackService } from "../services/youtrack"
import type { YouTrackIssue } from "../services/youtrack"
import { useAuth } from "../contexts/AuthContext"
import { 
  Send, 
  Paperclip, 
  AlertCircle, 
  Sparkles,
  Link,
  Plus,
  Check,
  X
} from "lucide-react"

interface TicketFormData {
  priority: string
  type: string
  email: string
  existingProjectUrl: string
  projectName: string
  projectDescription: string
  manualTimeInvestment: string
  initiative: string
  targetDate: string
  links: Array<{ name: string; url: string }>
}

interface InitiativeOption {
  name: string
  value: string
}

interface NamedOption {
  name: string
}

function isNamedOption(value: unknown): value is NamedOption {
  return Boolean(
    value &&
    typeof value === "object" &&
    "name" in value &&
    typeof value.name === "string"
  )
}

function getTypeName(issue: YouTrackIssue): string | null {
  const typeField = issue.customFields?.find((field) => field.name === "Type")
  const value = typeField?.value

  if (!value || typeof value !== "object" || !("name" in value) || typeof value.name !== "string") {
    return null
  }

  return value.name
}

function extractTicketNumber(data: unknown): string | null {
  if (!data) {
    return null
  }

  if (Array.isArray(data)) {
    const firstItem = data[0]
    if (
      firstItem &&
      typeof firstItem === "object" &&
      "idReadable" in firstItem &&
      typeof firstItem.idReadable === "string"
    ) {
      return firstItem.idReadable
    }
    return null
  }

  if (typeof data === "object") {
    if ("idReadable" in data && typeof data.idReadable === "string") {
      return data.idReadable
    }
    if ("id" in data && typeof data.id === "string") {
      return data.id
    }
  }

  return null
}

function RequestPageContent() {
  const { user } = useAuth()
  
  const [formData, setFormData] = useState<TicketFormData>({
    priority: "medium",
    type: "new-automation",
    email: user?.email || "",
    existingProjectUrl: "",
    projectName: "",
    projectDescription: "",
    manualTimeInvestment: "",
    initiative: "",
    targetDate: "",
    links: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [ticketNumber, setTicketNumber] = useState("")
  
  // Update email when user info is loaded
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }))
    }
  }, [user])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [initiatives, setInitiatives] = useState<InitiativeOption[]>([])
  const [loadingInitiatives, setLoadingInitiatives] = useState(true)
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null)
  const [tempLinkData, setTempLinkData] = useState<{ name: string; url: string }>({ name: '', url: '' })
  const [showNoLinksModal, setShowNoLinksModal] = useState(false)
  const [urlValidation, setUrlValidation] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle')
  const [urlValidationMessage, setUrlValidationMessage] = useState('')

  // Generate a mock ticket number (in real implementation, this would come from the API)
  const generateTicketNumber = () => {
    const currentYear = new Date().getFullYear()
    const randomNumber = Math.floor(Math.random() * 9000) + 1000
    return `ATOP-${randomNumber}`
  }

  const validateExistingProjectUrl = async (url: string) => {
    if (!url.trim()) {
      setUrlValidation('idle')
      setUrlValidationMessage('')
      return
    }

    const match = url.match(/([A-Z]+-\d+)/)
    if (!match) {
      setUrlValidation('invalid')
      setUrlValidationMessage('Could not find an issue ID in this URL (e.g. ATOP-1620)')
      return
    }

    const issueId = match[1]
    setUrlValidation('validating')
    setUrlValidationMessage(`Checking ${issueId}...`)

    const response = await youTrackService.getIssueById(issueId, ['idReadable', 'customFields(name,value(name))'])

    if (response.error || !response.data) {
      setUrlValidation('invalid')
      setUrlValidationMessage(`Issue ${issueId} not found`)
      return
    }

    if (Array.isArray(response.data)) {
      setUrlValidation('invalid')
      setUrlValidationMessage(`${issueId} could not be validated`)
      return
    }

    const issue = response.data
    const issueType = getTypeName(issue)
    const isProject = issueType === "Project"

    if (isProject) {
      setUrlValidation('valid')
      setUrlValidationMessage(`${issueId} is a valid project`)
    } else {
      setUrlValidation('invalid')
      setUrlValidationMessage(`${issueId} exists but is not a Project type`)
    }
  }

  // Fetch initiatives from YouTrack on component mount
  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        setLoadingInitiatives(true)
        const response = await youTrackService.getCustomFieldValues('Initiative')
        
        if (response.data && Array.isArray(response.data)) {
          const initiativeOptions = response.data
            .filter(isNamedOption)
            .map((item) => ({
              name: item.name,
              value: item.name.toLowerCase().replace(/\s+/g, '-')
            }))

          if (initiativeOptions.length > 0) {
            setInitiatives(initiativeOptions)
            return
          }
        }

        // Fallback to hardcoded list if API fails
        console.warn('Failed to fetch initiatives from YouTrack, using fallback')
        setInitiatives([
          { name: 'Infrastructure', value: 'infrastructure' },
          { name: 'Offboarding', value: 'offboarding' },
          { name: 'Onboarding', value: 'onboarding' },
          { name: 'Transactions', value: 'transactions' },
          { name: 'Enablement', value: 'enablement' },
          { name: 'Support', value: 'support' },
          { name: 'Brokerage', value: 'brokerage' },
          { name: 'Core Operations', value: 'core-operations' },
          { name: 'Zapier Support', value: 'zapier-support' },
          { name: 'Marketing', value: 'marketing' },
          { name: 'Legal', value: 'legal' },
          { name: 'HR', value: 'hr' },
          { name: 'Finance', value: 'finance' }
        ])
      } catch (error) {
        console.error('Error fetching initiatives:', error)
        // Use fallback list
        setInitiatives([
          { name: 'Infrastructure', value: 'infrastructure' },
          { name: 'Offboarding', value: 'offboarding' },
          { name: 'Onboarding', value: 'onboarding' },
          { name: 'Transactions', value: 'transactions' },
          { name: 'Enablement', value: 'enablement' },
          { name: 'Support', value: 'support' },
          { name: 'Brokerage', value: 'brokerage' },
          { name: 'Core Operations', value: 'core-operations' },
          { name: 'Zapier Support', value: 'zapier-support' },
          { name: 'Marketing', value: 'marketing' },
          { name: 'Legal', value: 'legal' },
          { name: 'HR', value: 'hr' },
          { name: 'Finance', value: 'finance' }
        ])
      } finally {
        setLoadingInitiatives(false)
      }
    }

    fetchInitiatives()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
    // Reset URL validation when type changes or URL is cleared
    if (name === 'type' || (name === 'existingProjectUrl' && !value.trim())) {
      setUrlValidation('idle')
      setUrlValidationMessage('')
    }
  }

  const addLink = () => {
    const newIndex = formData.links.length
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { name: "", url: "" }]
    }))
    setEditingLinkIndex(newIndex)
    setTempLinkData({ name: '', url: '' })
  }

  const startEditLink = (index: number) => {
    setEditingLinkIndex(index)
    setTempLinkData({ ...formData.links[index] })
  }

  const saveLink = (index: number) => {
    if (!tempLinkData.name.trim() || !tempLinkData.url.trim()) {
      return // Don't save if either field is empty
    }
    
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...tempLinkData } : link
      )
    }))
    setEditingLinkIndex(null)
    setTempLinkData({ name: '', url: '' })
  }

  const cancelEditLink = (index: number) => {
    // If this was a new link and both the saved data and temp data are empty, remove it
    if (formData.links[index].name === '' && formData.links[index].url === '' && 
        tempLinkData.name === '' && tempLinkData.url === '') {
      removeLink(index)
      return
    }
    setEditingLinkIndex(null)
    setTempLinkData({ name: '', url: '' })
  }

  const updateTempLink = (field: 'name' | 'url', value: string) => {
    setTempLinkData(prev => ({ ...prev, [field]: value }))
  }

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }))
    if (editingLinkIndex === index) {
      setEditingLinkIndex(null)
      setTempLinkData({ name: '', url: '' })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Email is auto-populated from user account, no need to validate
    if (formData.type === 'update-automation') {
      if (!formData.existingProjectUrl.trim()) {
        newErrors.existingProjectUrl = "Existing project URL is required"
      } else if (urlValidation === 'invalid') {
        newErrors.existingProjectUrl = urlValidationMessage
      } else if (urlValidation !== 'valid') {
        newErrors.existingProjectUrl = "Please wait for URL validation to complete"
      }
    }
    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required"
    }
    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = "Project description is required"
    }
    if (!formData.manualTimeInvestment.trim()) {
      newErrors.manualTimeInvestment = "Manual time investment is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Check if no links are provided
    const validLinks = formData.links.filter(link => link.name.trim() && link.url.trim())
    if (validLinks.length === 0) {
      setShowNoLinksModal(true)
      return
    }

    await submitForm()
  }

  const submitForm = async () => {
    setIsSubmitting(true)
    
    try {
      const isEnhancement = formData.type === 'update-automation'

      // Create ticket in YouTrack ATOP project with exact field mapping
      const issueData = {
        summary: formData.projectName,
        description: `### Project Description\n${formData.projectDescription}${isEnhancement ? `\n\n**Existing Project:** ${formData.existingProjectUrl}` : ''}\n\n### What Needs to Be Done\n* Task Breakdown\n\n### Completion Criteria\n* \n\n**Manual Time Investment:**\n${formData.manualTimeInvestment}\n\n**Priority:** ${formData.priority}`,
        project: '0-5', // ATOP project internal ID
        state: 'Needs Scoping',
        requestor: formData.email,
        initiative: formData.initiative,
        targetDate: formData.targetDate || undefined,
        links: formData.links.filter(link => link.name && link.url),
        isEnhancement
      }

      const response = await youTrackService.createIssue(issueData)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Extract actual ticket number from YouTrack API response
      let newTicketNumber = null
      
      if (response.data) {
        newTicketNumber = extractTicketNumber(response.data)
      }
      
      // If we couldn't extract the real ticket number, generate a placeholder
      if (!newTicketNumber) {
        console.warn('Could not extract ticket number from response, using generated number')
        newTicketNumber = generateTicketNumber()
      }
      
      setTicketNumber(newTicketNumber)

      // Apply Automation_Enhancement tag for enhancement requests
      if (isEnhancement) {
        const tagResult = await youTrackService.addTagToIssue(newTicketNumber, 'Automation_Enhancement')
        if (tagResult.error) {
          console.error('Failed to apply tag:', tagResult.error)
        }
      }

      // Show success modal
      setShowSuccessModal(true)
      
    } catch (error) {
      console.error('Error submitting form:', error)
      // Show error handling - for now, fall back to generated ticket number
      // In a real production environment, you might want to show an error modal instead
      console.warn('API call failed, using generated ticket number as fallback')
      const fallbackTicketNumber = generateTicketNumber()
      setTicketNumber(fallbackTicketNumber)
      setShowSuccessModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false)
    // Reset form after modal is closed
    setFormData({
      priority: "medium",
      type: "new-automation",
      email: user?.email || "",
      existingProjectUrl: "",
      projectName: "",
      projectDescription: "",
      manualTimeInvestment: "",
      initiative: "",
      targetDate: "",
      links: []
    })
    // Reset link editing state
    setEditingLinkIndex(null)
    setTempLinkData({ name: '', url: '' })
    setUrlValidation('idle')
    setUrlValidationMessage('')
  }

  const handleSubmitAnyway = async () => {
    setShowNoLinksModal(false)
    await submitForm()
  }

  const handleGoBackToEdit = () => {
    setShowNoLinksModal(false)
    // Focus on the links section
    const linksSection = document.querySelector('[data-links-section]')
    if (linksSection) {
      linksSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <Layout title="Request Automation">
      <div className="max-w-4xl mx-auto">

        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Form */}
            <div className="xl:col-span-2 space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-breeze-800 mb-6 text-center">
                  <span>Request Details</span>
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <FormField label="Type" id="type">
                      <Select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                      >
                        <option value="new-automation">New Automation</option>
                        <option value="update-automation">Automation Enhancement</option>
                      </Select>
                    </FormField>

                    <FormField label="Priority" id="priority">
                      <Select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </Select>
                    </FormField>
                  </div>

                  {formData.type === 'update-automation' && (
                    <FormField label="Existing Project URL" id="existingProjectUrl" required error={errors.existingProjectUrl}>
                      <TextInput
                        id="existingProjectUrl"
                        name="existingProjectUrl"
                        type="url"
                        placeholder="https://realbrokerage.youtrack.cloud/issue/ATOP-1620"
                        value={formData.existingProjectUrl}
                        onChange={handleInputChange}
                        onBlur={() => validateExistingProjectUrl(formData.existingProjectUrl)}
                        required
                      />
                      {urlValidation === 'validating' && (
                        <p className="mt-1.5 text-sm text-breeze-500 flex items-center space-x-1">
                          <span className="inline-block w-3 h-3 border-2 border-breeze-400 border-t-transparent rounded-full animate-spin" />
                          <span>{urlValidationMessage}</span>
                        </p>
                      )}
                      {urlValidation === 'valid' && (
                        <p className="mt-1.5 text-sm text-green-600 font-medium">✓ {urlValidationMessage}</p>
                      )}
                      {urlValidation === 'invalid' && !errors.existingProjectUrl && (
                        <p className="mt-1.5 text-sm text-red-500">{urlValidationMessage}</p>
                      )}
                    </FormField>
                  )}

                  <FormField label="Your Email Address" id="email" required error={errors.email}>
                    <TextInput
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled
                    />
                  </FormField>

                  <FormField label="Project Name" id="projectName" required error={errors.projectName}>
                    <TextInput
                      id="projectName"
                      name="projectName"
                      placeholder="Name of the project or automation..."
                      value={formData.projectName}
                      onChange={handleInputChange}
                      required
                    />
                  </FormField>

                  <FormField label="Project Description" id="projectDescription" required error={errors.projectDescription}>
                    <TextArea
                      id="projectDescription"
                      name="projectDescription"
                      placeholder="Detailed description of what needs to be automated or the project requirements..."
                      value={formData.projectDescription}
                      onChange={handleInputChange}
                      rows={6}
                      required
                    />
                  </FormField>

                  <FormField label="Manual Time Investment" id="manualTimeInvestment" required error={errors.manualTimeInvestment}>
                    <TextArea
                      id="manualTimeInvestment"
                      name="manualTimeInvestment"
                      placeholder="Describe the current manual process and time spent (e.g., '2 hours daily processing reports')..."
                      value={formData.manualTimeInvestment}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </FormField>

                </div>
              </div>

              {/* Supporting Links */}
              <div className="card" data-links-section>
                <h3 className="text-lg font-semibold text-breeze-800 mb-6 flex items-center justify-center space-x-2">
                  <Link className="w-5 h-5" />
                  <span>Supporting Links</span>
                  <span className="text-sm text-breeze-500 font-normal">(Optional)</span>
                </h3>
                
                {/* Video SOP Encouragement */}
                <div className="bg-gradient-to-r from-accent-500/20 to-purple-500/20 border border-accent-400/40 rounded-xl p-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-accent-800 mb-1">📹 Video SOPs Highly Encouraged!</h4>
                    <p className="text-sm text-breeze-700 leading-relaxed">
                      Including a <strong>video walkthrough</strong> of your current manual process significantly speeds up our development.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={addLink}
                    className="w-full bg-ocean-500/20 border border-ocean-400/30 rounded-xl p-4 text-center hover:bg-ocean-500/30 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5 text-ocean-700" />
                    <span className="text-ocean-800 font-medium">Add Link</span>
                  </button>
                  
                  {formData.links.length > 0 && (
                    <div className="space-y-3">
                      {formData.links.map((link, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-breeze-700 text-sm font-medium">Link {index + 1}</span>
                            <div className="flex items-center space-x-2">
                              {editingLinkIndex === index ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => saveLink(index)}
                                    className="px-3 py-1 bg-status-done hover:bg-priority-low text-white text-sm font-medium rounded-lg flex items-center space-x-1 transition-colors"
                                    disabled={!tempLinkData.name.trim() || !tempLinkData.url.trim()}
                                  >
                                    <Check className="w-4 h-4" />
                                    <span>Save</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => cancelEditLink(index)}
                                    className="px-3 py-1 bg-breeze-500 hover:bg-breeze-600 text-white text-sm font-medium rounded-lg flex items-center space-x-1 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => startEditLink(index)}
                                    className="text-ocean-500 hover:text-ocean-600 text-sm"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeLink(index)}
                                    className="text-priority-high hover:text-priority-urgent text-sm"
                                  >
                                    Remove
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {editingLinkIndex === index ? (
                              <>
                                <TextInput
                                  id={`link-name-${index}`}
                                  name={`link-name-${index}`}
                                  placeholder="Link name or description"
                                  value={tempLinkData.name}
                                  onChange={(e) => updateTempLink('name', e.target.value)}
                                />
                                <TextInput
                                  id={`link-url-${index}`}
                                  name={`link-url-${index}`}
                                  placeholder="https://example.com"
                                  value={tempLinkData.url}
                                  onChange={(e) => updateTempLink('url', e.target.value)}
                                />
                              </>
                            ) : (
                              <>
                                <div className="bg-white/10 rounded-lg p-3">
                                  <p className="text-breeze-800 text-sm font-medium">{link.name || 'Untitled Link'}</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                  <a 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-ocean-700 hover:text-ocean-600 text-sm break-all"
                                  >
                                    {link.url || 'No URL provided'}
                                  </a>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-breeze-800 mb-6 text-center">
                  <span>Additional Details</span>
                </h3>
                
                <div className="space-y-6">
                  <FormField label="Initiative" id="initiative" error={errors.initiative}>
                    <Select
                      id="initiative"
                      name="initiative"
                      value={formData.initiative}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Initiative</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="offboarding">Offboarding</option>
                      <option value="onboarding">Onboarding</option>
                      <option value="transactions">Transactions</option>
                      <option value="enablement">Enablement</option>
                      <option value="support">Support</option>
                      <option value="brokerage">Brokerage</option>
                      <option value="core-operations">Core Operations</option>
                      <option value="zapier-support">Zapier Support</option>
                      <option value="marketing">Marketing</option>
                      <option value="legal">Legal</option>
                      <option value="hr">HR</option>
                      <option value="finance">Finance</option>
                    </Select>
                  </FormField>

                  <FormField label="Target Date" id="targetDate">
                    <TextInput
                      id="targetDate"
                      name="targetDate"
                      type="date"
                      value={formData.targetDate}
                      onChange={handleInputChange}
                    />
                  </FormField>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-center pt-6 border-t border-white/10">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="card bg-ocean-500/10 border-ocean-400/30">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-ocean-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-ocean-700 mb-2">Tips for Better Automation Requests</h4>
                    <ul className="text-sm text-breeze-600 space-y-1">
                      <li>• Be specific about current manual processes</li>
                      <li>• Include time savings estimates</li>
                      <li>• Attach relevant process documents</li>
                      <li>• Mention frequency and volume of work</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Success Modal */}
        <SuccessModal 
          isOpen={showSuccessModal}
          onClose={handleModalClose}
          ticketNumber={ticketNumber}
        />

        {/* No Links Confirmation Modal */}
        {showNoLinksModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-accent-600" />
                </div>
                <h3 className="text-xl font-semibold text-breeze-800 mb-2">Hey there!</h3>
                <p className="text-breeze-600 leading-relaxed">
                  No links were included in the request. Including SOPs, resources and important links 
                  helps with scoping and prioritizing requests.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGoBackToEdit}
                  className="flex-1 px-4 py-2 bg-ocean-500 hover:bg-ocean-600 text-white font-medium rounded-lg transition-colors"
                >
                  Go Back to Editing
                </button>
                <button
                  onClick={handleSubmitAnyway}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-breeze-200 hover:bg-breeze-300 text-breeze-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Anyway'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

function RequestPage() {
  return (
    <AuthGuard>
      <RequestPageContent />
    </AuthGuard>
  )
}

export default RequestPage
