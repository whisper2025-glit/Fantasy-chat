# Markdown Image Support

This application now supports displaying images using markdown syntax in chat messages.

## Syntax

Use the standard markdown image syntax:

\`\`\`
![Alt Text](Image URL)
\`\`\`

## Examples

\`\`\`
![My Cool Picture](https://example.com/image.jpg)
![](https://i.imgur.com/sample.png)
![Nature Photo](https://images.unsplash.com/photo-sample.webp)
\`\`\`

## Supported Image Formats

- JPG/JPEG
- PNG
- GIF
- WebP
- SVG
- BMP
- ICO

## Supported Domains

The system validates image URLs and supports:

- imgur.com / i.imgur.com
- cdn.discordapp.com / media.discordapp.net
- i.redd.it / preview.redd.it
- cdn.builder.io
- images.unsplash.com
- Any URL ending with image file extensions

## Features

✅ **Auto-loading**: Images load automatically when messages are sent
✅ **Error handling**: Shows error message if image fails to load
✅ **Loading states**: Shows spinner while image is loading
✅ **Click to open**: Click any image to open it in a new tab
✅ **Responsive**: Images scale properly on mobile devices
✅ **Hover effects**: Subtle zoom effect on hover
✅ **Security**: URL validation prevents malicious content

## Technical Implementation

### Components Added:

- `MarkdownImage`: React component for rendering images with error handling
- `parseMarkdownText`: Enhanced text parser that handles both images and links
- CSS styles for proper image layout in chat bubbles

### Files Modified:

- `lib/utils.tsx`: Added markdown parsing functionality
- `components/chat/message-bubble.tsx`: Updated to use markdown parser
- `components/chat-interface.tsx`: Updated to use markdown parser
- `components/character-creation.tsx`: Added preview support
- `components/chat/chat-input.tsx`: Updated placeholder text
- `app/globals.css`: Added image styling

### Security Features:

- URL validation to ensure only safe image URLs
- Domain whitelist for trusted sources
- File extension validation
- Error handling for broken images

## Usage in Chat

1. Type a message with markdown image syntax
2. Send the message
3. The image will automatically load and display
4. Click the image to view it full-size in a new tab

## Troubleshooting

**Image not loading?**

- Ensure the URL is publicly accessible
- Check that the URL ends with a supported image extension
- Verify the domain is supported or the URL has a valid image extension

**Image too large?**

- Images are automatically resized to fit within chat bubbles
- Maximum height is set to 400px on desktop, 300px on mobile
