"use client"

import React from "react"

/**
 * Lightweight Markdown renderer for chat messages.
 * Converts markdown syntax to formatted React elements.
 * Handles: bold, italic, headers, bullets, numbered lists, links, code, blockquotes.
 */

interface FormattedMessageProps {
  content: string
  className?: string
}

/**
 * Parse a single line of text and convert inline markdown (bold, italic, code, links)
 */
function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    // Italic: *text*
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/)
    // Inline code: `text`
    const codeMatch = remaining.match(/`([^`]+)`/)
    // Link: [text](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/)

    // Find earliest match
    const matches = [
      boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
      italicMatch ? { type: 'italic', match: italicMatch, index: italicMatch.index! } : null,
      codeMatch ? { type: 'code', match: codeMatch, index: codeMatch.index! } : null,
      linkMatch ? { type: 'link', match: linkMatch, index: linkMatch.index! } : null,
    ].filter(Boolean).sort((a, b) => a!.index - b!.index)

    if (matches.length === 0) {
      // No more matches — push remaining text
      if (remaining) nodes.push(remaining)
      break
    }

    const first = matches[0]!

    // Push text before the match
    if (first.index > 0) {
      nodes.push(remaining.substring(0, first.index))
    }

    // Render match
    switch (first.type) {
      case 'bold':
        nodes.push(
          <strong key={key++} className="font-semibold text-foreground">
            {first.match[1]}
          </strong>
        )
        remaining = remaining.substring(first.index + first.match[0].length)
        break
      case 'italic':
        nodes.push(
          <em key={key++} className="italic">
            {first.match[1]}
          </em>
        )
        remaining = remaining.substring(first.index + first.match[0].length)
        break
      case 'code':
        nodes.push(
          <code key={key++} className="px-1.5 py-0.5 bg-muted rounded text-[0.85em] font-mono text-primary">
            {first.match[1]}
          </code>
        )
        remaining = remaining.substring(first.index + first.match[0].length)
        break
      case 'link':
        nodes.push(
          <a
            key={key++}
            href={first.match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80 transition-colors"
          >
            {first.match[1]}
          </a>
        )
        remaining = remaining.substring(first.index + first.match[0].length)
        break
    }
  }

  return nodes
}

/**
 * Parse full markdown content into structured React elements.
 */
export function FormattedMessage({ content, className = "" }: FormattedMessageProps) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null
  let key = 0

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={key++} className="my-1.5 ml-1 space-y-1">
            {currentList.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs md:text-sm leading-relaxed">
                <span className="text-primary mt-1 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )
      } else {
        elements.push(
          <ol key={key++} className="my-1.5 ml-1 space-y-1">
            {currentList.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs md:text-sm leading-relaxed">
                <span className="text-primary font-semibold mt-0 shrink-0 min-w-[1.2em]">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        )
      }
      currentList = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Empty line — flush list and add spacing
    if (!trimmed) {
      flushList()
      // Only add spacer if not at start/end
      if (elements.length > 0 && i < lines.length - 1) {
        elements.push(<div key={key++} className="h-2" />)
      }
      continue
    }

    // Headers: ### Header
    const headerMatch = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (headerMatch) {
      flushList()
      const level = headerMatch[1].length
      const text = headerMatch[2]
      if (level === 1) {
        elements.push(
          <h3 key={key++} className="text-sm md:text-base font-bold text-foreground mt-2 mb-1">
            {parseInline(text)}
          </h3>
        )
      } else if (level === 2) {
        elements.push(
          <h4 key={key++} className="text-xs md:text-sm font-bold text-foreground mt-1.5 mb-0.5">
            {parseInline(text)}
          </h4>
        )
      } else {
        elements.push(
          <h5 key={key++} className="text-xs md:text-sm font-semibold text-foreground mt-1 mb-0.5">
            {parseInline(text)}
          </h5>
        )
      }
      continue
    }

    // Unordered list: - item, • item, * item (at start of line)
    const ulMatch = trimmed.match(/^[-•●◦▪*]\s+(.+)$/)
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList()
        currentList = { type: 'ul', items: [] }
      }
      currentList.items.push(parseInline(ulMatch[1]))
      continue
    }

    // Ordered list: 1. item, 1) item, 1️⃣ item
    const olMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/) || trimmed.match(/^\d+️⃣\s*(.+)$/)
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList()
        currentList = { type: 'ol', items: [] }
      }
      // olMatch[2] for "1. item", olMatch[1] for "1️⃣ item"
      const itemText = olMatch[2] || olMatch[1]
      currentList.items.push(parseInline(itemText))
      continue
    }

    // Blockquote: > text
    const bqMatch = trimmed.match(/^>\s*(.+)$/)
    if (bqMatch) {
      flushList()
      elements.push(
        <blockquote key={key++} className="border-l-3 border-primary/30 pl-3 my-1 text-xs md:text-sm text-muted-foreground italic">
          {parseInline(bqMatch[1])}
        </blockquote>
      )
      continue
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      flushList()
      elements.push(<hr key={key++} className="my-2 border-border" />)
      continue
    }

    // Regular paragraph
    flushList()
    elements.push(
      <p key={key++} className="text-xs md:text-sm text-card-foreground leading-relaxed">
        {parseInline(trimmed)}
      </p>
    )
  }

  // Flush any remaining list
  flushList()

  return (
    <div className={`space-y-0.5 ${className}`}>
      {elements}
    </div>
  )
}
