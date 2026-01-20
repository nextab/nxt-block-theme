(function() {
	const { InspectorControls, RichText, MediaUpload, useBlockProps } = wp.blockEditor;
	const { PanelBody, TextControl, TextareaControl, SelectControl, Button, Disabled } = wp.components;
	const { createElement: el } = wp.element;
	const ServerSideRender = wp.serverSideRender ? wp.serverSideRender.default : null;

	wp.blocks.registerBlockType('nxt/info-box', {
		title: 'Info Box',
		icon: 'info',
		category: 'design',
		attributes: {
			title: {
				type: 'string',
				default: ''
			},
			content: {
				type: 'string',
				default: ''
			},
			iconUrl: {
				type: 'string',
				default: ''
			},
			iconAlt: {
				type: 'string',
				default: ''
			},
			boxStyle: {
				type: 'string',
				default: 'default'
			}
		},
		edit: ({ attributes, setAttributes }) => {
			const { title, content, iconUrl, iconAlt, boxStyle } = attributes;

			return el(
				'div',
				{},
				[
					el(InspectorControls, { key: 'inspector' },
						el(PanelBody, { title: 'Info Box Settings' },
							[
								el(TextControl, {
									key: 'title-control',
									label: 'Title',
									value: title,
									onChange: (value) => setAttributes({ title: value })
								}),
								el(TextareaControl, {
									key: 'content-control',
									label: 'Content',
									value: content,
									onChange: (value) => setAttributes({ content: value }),
									help: 'The main text content of the info box',
									rows: 4
								}),
								el(SelectControl, {
									key: 'style-control',
									label: 'Box Style',
									value: boxStyle,
									options: [
										{ label: 'Default', value: 'default' },
										{ label: 'Warning', value: 'warning' },
										{ label: 'Success', value: 'success' },
										{ label: 'Info', value: 'info' }
									],
									onChange: (value) => setAttributes({ boxStyle: value })
								}),
								el(MediaUpload, {
									key: 'media-upload',
									onSelect: (media) => setAttributes({ iconUrl: media.url, iconAlt: media.alt }),
									allowedTypes: ['image'],
									value: iconUrl,
									render: ({ open }) => el(Button, {
										onClick: open,
										variant: 'secondary'
									}, iconUrl ? 'Change Icon' : 'Upload Icon')
								}),
								iconUrl ? el(Button, {
									key: 'remove-icon',
									onClick: () => setAttributes({ iconUrl: '', iconAlt: '' }),
									variant: 'secondary',
									isDestructive: true,
									style: { marginTop: '8px' }
								}, 'Remove Icon') : null
							].filter(Boolean)
						)
					),
					ServerSideRender ? el(ServerSideRender, {
						key: 'preview',
						block: 'nxt/info-box',
						attributes: attributes
					}) : el(
						'div',
						{ 
							key: 'fallback',
							className: `nxt-info-box style-${boxStyle}`,
							style: {
								padding: '20px',
								border: '1px solid #ddd',
								borderRadius: '4px',
								marginTop: '10px'
							}
						},
						[
							iconUrl ? el('img', {
								key: 'icon',
								src: iconUrl,
								alt: iconAlt,
								className: 'info-box-icon',
								style: { maxWidth: '50px', marginBottom: '10px' }
							}) : null,
							title ? el('h3', { 
								key: 'title',
								style: { marginTop: 0 }
							}, title) : el('p', {
								key: 'no-title',
								style: { fontStyle: 'italic', color: '#999' }
							}, 'No title set'),
							content ? el('p', { 
								key: 'content',
								style: { marginBottom: 0 }
							}, content) : el('p', {
								key: 'no-content',
								style: { fontStyle: 'italic', color: '#999' }
							}, 'No content set')
						].filter(Boolean)
					)
				]
			);
		},
		save: () => {
			return null;
		},
		deprecated: [
			{
				attributes: {
					title: {
						type: 'string',
						default: 'Info Box Title'
					},
					content: {
						type: 'string',
						default: 'This is the content of the info box.'
					},
					iconUrl: {
						type: 'string',
						default: ''
					},
					iconAlt: {
						type: 'string',
						default: ''
					},
					boxStyle: {
						type: 'string',
						default: 'default'
					}
				},
				save: () => {
					return null;
				},
				migrate: (attributes) => {
					return {
						title: attributes.title || '',
						content: attributes.content || '',
						iconUrl: attributes.iconUrl || '',
						iconAlt: attributes.iconAlt || '',
						boxStyle: attributes.boxStyle || 'default'
					};
				}
			}
		]
	});
})();