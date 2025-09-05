import React, { useState, useEffect } from "react"
import { Layout } from "../components/Layout"
import { FormField, TextInput, TextArea, Select } from "../components/FormField"
import { youTrackService } from "../services/youtrack"
import { 
  Send, 
  Paperclip, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  Clock
} from "lucide-react"

interface TicketFormData {
  title: string
  description: string
  priority: string
  type: string
  email: string
  projectName: string
  projectDescription: string
  manualTimeInvestment: string
  initiative: string
  dueDate: string
  attachments: File[]
}

interface InitiativeOption {
  name: string
  value: string
}

function RequestPage() {
  const [formData, setFormData] = useState<TicketFormData>({
    title: "",
    description: "",
    priority: "medium",
    type: "new-automation",
    email: "",
    projectName: "",
    projectDescription: "",
    manualTimeInvestment: "",
    initiative: "",
    dueDate: "",
    attachments: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [initiatives, setInitiatives] = useState<InitiativeOption[]>([])
  const [loadingInitiatives, setLoadingInitiatives] = useState(true)

  // Fetch initiatives from YouTrack on component mount
  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        setLoadingInitiatives(true)
        const response = await youTrackService.getCustomFieldValues('Initiative')
        
        if (response && Array.isArray(response) && response.length > 0) {
          const initiativeOptions = response.map((item: any) => ({
            name: item.name,
            value: item.name.toLowerCase().replace(/\s+/g, '-')
          }))
          setInitiatives(initiativeOptions)
          console.log('Loaded initiatives from YouTrack:', initiativeOptions)
        } else if (response.data && Array.isArray(response.data)) {
          const initiativeOptions = response.data.map((item: any) => ({
            name: item.name,
            value: item.name.toLowerCase().replace(/\s+/g, '-')
          }))
          setInitiatives(initiativeOptions)
          console.log('Loaded initiatives from YouTrack (nested):', initiativeOptions)
        } else {
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
        }
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
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }))
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
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
    if (!formData.initiative) {
      newErrors.initiative = "Please select an initiative"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitSuccess(true)
    
    // Reset form after success
    setTimeout(() => {
      setSubmitSuccess(false)
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        type: "new-automation",
        email: "",
        projectName: "",
        projectDescription: "",
        manualTimeInvestment: "",
        initiative: "",
        dueDate: "",
        attachments: []
      })
    }, 3000)
  }

  if (submitSuccess) {
    return (
      <Layout title="Request Automation">
        <div className="max-w-2xl mx-auto">
          <div className="card text-center py-12">
            <div className="relative mb-6">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Ticket Submitted Successfully!</h2>
            <p className="text-white/70 mb-6">
              Your request has been submitted and will be reviewed by our team. 
              You should receive a confirmation email shortly.
            </p>
            <div className="flex items-center justify-center space-x-2 text-accent-300">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Estimated response time: 2-4 hours</span>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Request Automation">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Request Automation</h1>
              <p className="text-white/70 mt-1">
                Submit a detailed request and our team will get back to you
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-ocean-400 rounded-full" />
                  <span>Request Details</span>
                </h3>
                
                <div className="space-y-6">
                  <FormField label="Title" id="title" required error={errors.title}>
                    <TextInput
                      id="title"
                      name="title"
                      placeholder="Brief summary of your request..."
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </FormField>

                  <FormField label="Email" id="email" required error={errors.email}>
                    <TextInput
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Type" id="type">
                      <Select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                      >
                        <option value="new-automation">New Automation</option>
                        <option value="update-automation">Update Existing Automation</option>
                        <option value="new-tool">New Tool</option>
                        <option value="research">Research</option>
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
                </div>
              </div>

              {/* Supporting Files */}
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center justify-center space-x-2">
                  <Paperclip className="w-5 h-5" />
                  <span>Supporting Files</span>
                  <span className="text-sm text-white/50 font-normal">(Optional)</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/30 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Paperclip className="w-8 h-8 text-white/50 mx-auto mb-2" />
                      <p className="text-white/70 font-medium">Click to upload files</p>
                      <p className="text-white/50 text-sm mt-1">PDF, DOC, images up to 10MB each</p>
                    </label>
                  </div>
                  
                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                          <span className="text-white/80 text-sm">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
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
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-400 rounded-full" />
                  <span>Assignment</span>
                </h3>
                
                <div className="space-y-6">
                  <FormField label="Initiative" id="initiative" required error={errors.initiative}>
                    <Select
                      id="initiative"
                      name="initiative"
                      value={formData.initiative}
                      onChange={handleInputChange}
                      required
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

                  <FormField label="Due Date" id="dueDate">
                    <TextInput
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      value={formData.dueDate}
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
                    <h4 className="font-medium text-ocean-200 mb-2">Tips for Better Automation Requests</h4>
                    <ul className="text-sm text-white/70 space-y-1">
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
      </div>
    </Layout>
  )
}

export default RequestPage

export function Head() {
  return (
    <>
      <title>Request Automation - YouTrack</title>
      <meta name="description" content="Submit a new automation request" />
    </>
  )
}
