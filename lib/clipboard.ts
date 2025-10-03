/**
 * Clipboard utility functions for copying text to clipboard
 * Supports modern Clipboard API with fallback for older browsers
 */

/**
 * Copy text to clipboard using the modern Clipboard API with fallback
 * @param text - The text to copy to clipboard
 * @returns Promise<boolean> - True if successful, false if failed
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Check if the modern Clipboard API is available and we're in a secure context
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers or non-secure contexts
      return fallbackCopyTextToClipboard(text)
    }
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

/**
 * Fallback method for copying text to clipboard using document.execCommand
 * @param text - The text to copy to clipboard
 * @returns boolean - True if successful, false if failed
 */
function fallbackCopyTextToClipboard(text: string): boolean {
  try {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea')
    textArea.value = text
    
    // Make the textarea invisible
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    textArea.style.opacity = '0'
    textArea.setAttribute('readonly', '')
    
    // Add to DOM, select, and copy
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    return successful
  } catch (err) {
    console.error('Fallback copy failed: ', err)
    return false
  }
}

/**
 * Check if clipboard functionality is available in the current environment
 * @returns boolean - True if clipboard is available, false otherwise
 */
export function isClipboardAvailable(): boolean {
  return !!(navigator.clipboard || document.queryCommandSupported?.('copy'))
}
