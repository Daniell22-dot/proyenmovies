// app/(admin)/upload/page.tsx - MODIFIED FOR DATABASE STORAGE
'use client'

import { useState, useRef } from 'react'
import { Upload, X, Music, Video, Image, File, CheckCircle, Database, HardDrive } from 'lucide-react'

export default function MediaUploadPage() {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [storageType, setStorageType] = useState<'database' | 'disk'>('database') // NEW
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '0.99',
    artist: '',
    tags: '',
    media_type: 'song'
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles(files)
    setUploadResult(null)

    if (!formData.title && files.length === 1) {
      const fileName = files[0].name.replace(/\.[^/.]+$/, "")
      setFormData(prev => ({ ...prev, title: fileName }))
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (uploadedFiles.length === 0) {
      alert('Please select files to upload')
      return
    }

    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    // Check file sizes for database storage
    if (storageType === 'database') {
      const maxSize = 16 * 1024 * 1024; // 16MB MySQL limit for efficient BLOB storage
      for (const file of uploadedFiles) {
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large for database storage (max ${maxSize / 1024 / 1024}MB). Use disk storage instead.`)
          return
        }
      }
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    try {
      const results = []
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const endpoint = storageType === 'database'
        ? `${apiUrl}/media/upload-media`
        : `${apiUrl}/media/upload-to-disk`

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]

        const formDataToSend = new FormData()
        formDataToSend.append('file', file)
        formDataToSend.append('title', formData.title || file.name)
        formDataToSend.append('description', formData.description)
        formDataToSend.append('price', formData.price)
        formDataToSend.append('artist', formData.artist || 'Unknown Artist')
        formDataToSend.append('media_type', formData.media_type)
        formDataToSend.append('tags', formData.tags)
        formDataToSend.append('is_published', 'true')

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formDataToSend
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Upload failed: ${response.status}`)
        }

        const result = await response.json()
        results.push(result)

        setUploadProgress(Math.round(((i + 1) / uploadedFiles.length) * 100))
      }

      setUploadResult({
        success: true,
        message: `Successfully uploaded ${results.length} file(s) to ${storageType}`,
        results,
        storageType
      })

      if (uploadedFiles.length === 1) {
        resetForm()
      } else {
        setUploadedFiles([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }

    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadResult({
        success: false,
        message: error.message || 'Upload failed. Please try again.'
      })
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '0.99',
      artist: '',
      tags: '',
      media_type: 'song'
    })
    setUploadedFiles([])
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'song': return <Music className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'image': return <Image className="w-5 h-5" />
      default: return <File className="w-5 h-5" />
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['mp3', 'wav', 'm4a'].includes(ext || '')) return <Music className="w-5 h-5" />
    if (['mp4', 'mov', 'avi'].includes(ext || '')) return <Video className="w-5 h-5" />
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <Image className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Upload Media</h1>
        <p className="text-gray-600 mb-8">Store files in database or on server disk</p>

        {/* Storage Type Selector */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-4">Storage Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setStorageType('database')}
              className={`p-4 rounded-lg border-2 transition-all ${storageType === 'database' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-center">
                <Database className={`w-5 h-5 mr-3 ${storageType === 'database' ? 'text-purple-600' : 'text-gray-500'}`} />
                <div className="text-left">
                  <p className={`font-medium ${storageType === 'database' ? 'text-purple-700' : 'text-gray-700'}`}>
                    Store in Database
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Files stored as BLOB in MySQL (recommended for files under 16MB)
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStorageType('disk')}
              className={`p-4 rounded-lg border-2 transition-all ${storageType === 'disk' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-center">
                <HardDrive className={`w-5 h-5 mr-3 ${storageType === 'disk' ? 'text-purple-600' : 'text-gray-500'}`} />
                <div className="text-left">
                  <p className={`font-medium ${storageType === 'disk' ? 'text-purple-700' : 'text-gray-700'}`}>
                    Store on Disk
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Files stored in uploads/ folder (recommended for larger files)
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {uploadResult && (
          <div className={`mb-6 p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start">
              {uploadResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              ) : (
                <X className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              )}
              <div>
                <p className={`font-medium ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {uploadResult.message}
                </p>
                {uploadResult.success && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Storage: <span className="font-medium">{uploadResult.storageType}</span></p>
                    {uploadResult.results && uploadResult.results.map((result: any, index: number) => (
                      <div key={index} className="mt-1">
                        <p>• {result.data?.title || 'File'}: {result.data?.file_size
                          ? `(${(result.data.file_size / 1024).toFixed(1)} KB)`
                          : 'uploaded'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form - Same as before but with storage info */}
          <div className="lg:col-span-2">
            <form onSubmit={handleUpload} className="space-y-6">
              {/* ... rest of your form stays the same ... */}
            </form>
          </div>

          {/* Upload Tips - Updated for database storage */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow sticky top-6">
              <h2 className="text-xl font-bold mb-6">
                {storageType === 'database' ? 'Database Storage' : 'Disk Storage'}
              </h2>

              <div className="space-y-4">
                {storageType === 'database' ? (
                  <>
                    <div>
                      <h3 className="font-medium mb-2">Database Storage:</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start">
                          <Database className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Files stored as BLOB in MySQL</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Better data integrity</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Automatic backups with database</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">⚠</span>
                          <span>Recommended for files under 16MB</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">⚠</span>
                          <span>Access via: /api/media/file/:id</span>
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="font-medium mb-2">Disk Storage:</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start">
                          <HardDrive className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Files stored in uploads/ folder</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Better for large files</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Faster file access</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">⚠</span>
                          <span>Requires disk space management</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">⚠</span>
                          <span>Access via: /uploads/filename</span>
                        </li>
                      </ul>
                    </div>
                  </>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-medium mb-2">Current Choice:</h3>
                  <div className={`p-3 rounded-lg ${storageType === 'database' ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className="flex items-center">
                      {storageType === 'database' ? (
                        <Database className="w-5 h-5 text-purple-600 mr-2" />
                      ) : (
                        <HardDrive className="w-5 h-5 text-blue-600 mr-2" />
                      )}
                      <div>
                        <p className="font-medium">
                          {storageType === 'database' ? 'Database Storage' : 'Disk Storage'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {storageType === 'database'
                            ? 'Files will be stored in MySQL database'
                            : 'Files will be saved to server disk'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}