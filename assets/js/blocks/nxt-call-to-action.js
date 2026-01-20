(function() {
	const { InspectorControls, RichText, URLInput } = wp.blockEditor;
	const { PanelBody, TextControl, ToggleControl, SelectControl } = wp.components;
	const { createElement: el } = wp.element;

	wp.blocks.registerBlockType('nxt/call-to-action', {
		title: 'Call to Action',
		icon: 'megaphone',
		category: 'common',
		attributes: {
			ctaTitle: {
				type: 'string',
				source: 'html',
				selector: '.nxt_cta_headline h3'
			},
			ctaContent: {
				type: 'string',
				source: 'html',
				selector: '.nxt_cta_content p'
			},
			buttonText: {
				type: 'string',
				source: 'html',
				selector: '.nxt_cta_button_wrapper a',
				default: 'Click Here'
			},
			buttonLink: {
				type: 'string',
				source: 'attribute',
				selector: '.nxt_cta_button_wrapper a',
				attribute: 'href',
				default: '#'
			},
			buttonTarget: {
				type: 'boolean',
				default: false
			},
			fullWidth: {
				type: 'boolean',
				default: false
			},
			textAlignLeft: {
				type: 'boolean',
				default: false
			},
			headlineFontSize: {
				type: 'string',
				default: 'h4-font-size'
			},
			contentFontSize: {
				type: 'string',
				default: 'medium'
			}
		},
		edit: function (props) {
			var attributes = props.attributes;
			
			const fontSizes = wp.data.select('core/block-editor').getSettings().fontSizes || [];
			const headlineFontSizeOptions = [
				{ label: 'Standard', value: '' },
				...fontSizes.map(size => ({
					label: size.name,
					value: size.slug
				}))
			];
			const contentFontSizeOptions = [
				{ label: 'Standard', value: '' },
				...fontSizes.map(size => ({
					label: size.name,
					value: size.slug
				}))
			];
	
			function onChangeTitle(newTitle) {
				props.setAttributes({ ctaTitle: newTitle });
			}
	
			function onChangeContent(newContent) {
				props.setAttributes({ ctaContent: newContent });
			}
	
			function onChangeButtonText(newButtonText) {
				props.setAttributes({ buttonText: newButtonText });
			}
	
			function onChangeButtonLink(newButtonLink) {
				props.setAttributes({ buttonLink: newButtonLink });
			}
	
			function onToggleButtonTarget(newValue) {
				props.setAttributes({ buttonTarget: newValue });
			}
	
			function onToggleFullWidth(newValue) {
				props.setAttributes({ fullWidth: newValue });
			}

			function onToggleTextAlign(newValue) {
				props.setAttributes({ textAlignLeft: newValue });
			}
			
			function onChangeHeadlineFontSize(newSize) {
				props.setAttributes({ headlineFontSize: newSize });
			}
			
			function onChangeContentFontSize(newSize) {
				props.setAttributes({ contentFontSize: newSize });
			}
			
			const headlineFontSizeValue = attributes.headlineFontSize || 'h4-font-size';
			const contentFontSizeValue = attributes.contentFontSize || 'medium';
			const headlineFontSizeClass = headlineFontSizeValue ? 'has-' + headlineFontSizeValue + '-font-size' : '';
			const contentFontSizeClass = contentFontSizeValue ? 'has-' + contentFontSizeValue + '-font-size' : '';
	
			return [
				el(
					InspectorControls,
					{},
					el(
						PanelBody,
						{ title: 'Typography', initialOpen: true },
						el(SelectControl, {
							label: 'Headline Schriftgröße',
							value: headlineFontSizeValue,
							options: headlineFontSizeOptions,
							onChange: onChangeHeadlineFontSize
						}),
						el(SelectControl, {
							label: 'Text Schriftgröße',
							value: contentFontSizeValue,
							options: contentFontSizeOptions,
							onChange: onChangeContentFontSize
						})
					),
					el(
						PanelBody,
						{ title: 'Button Settings', initialOpen: true },
						el(TextControl, {
							label: 'Button Link',
							value: attributes.buttonLink,
							onChange: onChangeButtonLink
						}),
						el(ToggleControl, {
							label: 'Open in new window',
							checked: attributes.buttonTarget,
							onChange: onToggleButtonTarget
						}),
						el(ToggleControl, {
							label: 'Full Width',
							checked: attributes.fullWidth,
							onChange: onToggleFullWidth
						}),
						el(ToggleControl, {
							label: 'Text linksbündig',
							checked: attributes.textAlignLeft,
							onChange: onToggleTextAlign
						})
					)
				),
				el(
					'div',
					{ className: props.className + (attributes.fullWidth ? ' fullwidth' : '') + (attributes.textAlignLeft ? ' text-left' : '') },
					el(RichText, {
						tagName: 'h3',
						placeholder: 'Add title...',
						value: attributes.ctaTitle,
						onChange: onChangeTitle,
						className: headlineFontSizeClass
					}),
					el(RichText, {
						tagName: 'p',
						placeholder: 'Add content...',
						value: attributes.ctaContent,
						onChange: onChangeContent,
						className: contentFontSizeClass
					}),
					el(
						'div',
						{ className: 'nxt_cta_button_wrapper' },
						el(RichText, {
							tagName: 'a',
							placeholder: 'Button Text...',
							value: attributes.buttonText,
							onChange: onChangeButtonText,
							href: attributes.buttonLink,
							target: attributes.buttonTarget ? '_blank' : '_self',
							className: 'wp-element-button',
							allowedFormats: []
						})
					)
				)
			];
		},
		save: function (props) {
			const { attributes } = props;
			const {
				ctaTitle,
				ctaContent,
				buttonText,
				buttonLink,
				buttonTarget,
				fullWidth,
				textAlignLeft,
				headlineFontSize,
				contentFontSize
			} = attributes;
			
			const headlineFontSizeValue = headlineFontSize || 'h4-font-size';
			const contentFontSizeValue = contentFontSize || 'medium';
			const headlineFontSizeClass = 'has-' + headlineFontSizeValue + '-font-size';
			const contentFontSizeClass = 'has-' + contentFontSizeValue + '-font-size';
			
			return el(
				'div',
				{ 
					className: `wp-block-nxt-call-to-action call-to-action${fullWidth ? ' fullwidth' : ''}${textAlignLeft ? ' text-left' : ''}`
				},
				el(
					'div',
					{ className: 'nxt_cta_headline' },
					el(RichText.Content, {
						tagName: 'h3',
						value: ctaTitle,
						className: headlineFontSizeClass
					})
				),
				el(
					'div',
					{ className: 'nxt_cta_content' },
					el(RichText.Content, {
						tagName: 'p',
						value: ctaContent,
						className: contentFontSizeClass
					})
				),
				el(
					'div',
					{ className: 'nxt_cta_button_wrapper' },
					el(RichText.Content, {
						tagName: 'a',
						value: buttonText,
						href: buttonLink || '#',
						target: buttonTarget ? '_blank' : '_self',
						className: 'wp-element-button'
					})
				)
			);
		}
	});

	wp.blocks.registerBlockStyle('nxt/call-to-action', {
		name: 'default',
		label: 'Standard',
		isDefault: true
	});

	wp.blocks.registerBlockStyle('nxt/call-to-action', {
		name: 'green',
		label: 'Grün'
	});

	wp.blocks.registerBlockStyle('nxt/call-to-action', {
		name: 'light-gray',
		label: 'Hellgrau'
	});

	wp.blocks.registerBlockStyle('nxt/call-to-action', {
		name: 'white',
		label: 'Weiß'
	});
})();