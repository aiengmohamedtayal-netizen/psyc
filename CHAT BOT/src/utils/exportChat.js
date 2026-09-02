/**
 * Utility to format and export a conversation session to Markdown format.
 *
 * @param {object} conversation
 * @param {string} [conversation.title]
 * @param {number} [conversation.updatedAt]
 * @param {Array<{ role: string, content: string }>} [conversation.messages]
 */
export function exportConversationToMarkdown(conversation) {
  if (!conversation || !conversation.messages?.length) {
    return
  }

  const title = conversation.title || 'Stress AI Consultation'
  const dateStr = new Date(conversation.updatedAt || Date.now()).toLocaleString()

  let markdownContent = `# ${title}\n`
  markdownContent += `*Date: ${dateStr}*\n\n---\n\n`

  for (const message of conversation.messages) {
    const roleTitle = message.role === 'user' ? '👤 **You**' : '✳ **Stress AI**'
    markdownContent += `${roleTitle}:\n${message.content}\n\n`
  }

  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' })
  const downloadUrl = URL.createObjectURL(blob)
  const anchorElement = document.createElement('a')

  anchorElement.href = downloadUrl
  anchorElement.download = `stress-ai-chat-${Date.now()}.md`
  anchorElement.click()

  URL.revokeObjectURL(downloadUrl)
}
