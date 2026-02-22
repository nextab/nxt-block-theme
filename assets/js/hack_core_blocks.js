//#region Button Styles
wp.domReady( () => {
	wp.blocks.unregisterBlockStyle('core/button', 'outline');
	wp.blocks.unregisterBlockStyle('core/button', 'fill');
})
wp.blocks.registerBlockStyle('core/button', {
	name: 'default-button',
	label: 'Standard',
	isDefault: true
});
wp.blocks.registerBlockStyle('core/button', {
	name: 'white-button',
	label: 'Weiß'
});
//#endregion Button Styles
//#region Paragraph Styles
wp.blocks.registerBlockStyle('core/paragraph', {
	name: 'highlight-text',
	label: 'Hervorhebungstext',
	isDefault: false
});
//#endregion Paragraph Styles
//#region Group Styles
wp.blocks.registerBlockStyle('core/group', {
	name: 'group-slider-container',
	label: 'Slider Container',
	isDefault: false
});
wp.blocks.registerBlockStyle('core/group', {
	name: 'long-text',
	label: 'Fließtext',
	isDefault: false
});
//#endregion Group Styles
//#region Column Styles
wp.blocks.registerBlockStyle('core/columns', {
	name: 'column-4-2-1',
	label: '4/2/1',
	isDefault: false
});
wp.blocks.registerBlockStyle('core/column', {
	name: 'long-text',
	label: 'Fließtext',
	isDefault: false
});
//#endregion Column Styles
//#region Heading Styles
wp.blocks.registerBlockStyle('core/heading', {
	name: 'no-margin',
	label: 'Kein Abstand',
	isDefault: false
});
//#endregion Heading Styles

//#region Add reverse order functionality to Columns Block
(function(wp) {
	const { addFilter } = wp.hooks;
	const { createHigherOrderComponent } = wp.compose;
	const { InspectorControls } = wp.blockEditor;
	const { PanelBody, ToggleControl } = wp.components;
	const { __ } = wp.i18n;
	const { createElement, Fragment } = wp.element;

	addFilter(
		'blocks.registerBlockType',
		'core/columns-reverse-order-attribute',
		(settings, name) => {
			if (name !== 'core/columns') {
				return settings;
			}

			return {
				...settings,
				attributes: {
					...settings.attributes,
					reverseOrderOnMobile: {
						type: 'boolean',
						default: false,
					},
				},
			};
		}
	);

	const withCustomSettings = createHigherOrderComponent((BlockEdit) => {
		return (props) => {
			if (props.name !== 'core/columns') {
				return createElement(BlockEdit, props);
			}

			const { attributes, setAttributes } = props;
			const { reverseOrderOnMobile, isStackedOnMobile } = attributes;

			return createElement(
				Fragment,
				null,
				createElement(BlockEdit, props),
				isStackedOnMobile && createElement(
					InspectorControls,
					{ group: 'settings' },
					createElement(ToggleControl, {
						label: __('Reverse order on mobile'),
						checked: reverseOrderOnMobile,
						onChange: (value) => setAttributes({ reverseOrderOnMobile: value }),
					})
				)
			);
		};
	}, 'withCustomSettings');

	addFilter(
		'editor.BlockEdit',
		'core/columns-custom-settings',
		withCustomSettings
	);

	addFilter(
		'blocks.getSaveContent.extraProps',
		'core/columns-reverse-order-save',
		(extraProps, blockType, attributes) => {
			if (blockType.name !== 'core/columns') {
				return extraProps;
			}

			let className = extraProps.className || '';

			if (attributes.reverseOrderOnMobile) {
				className += ' reverse-responsive';
			}

			extraProps.className = className.trim();
			return extraProps;
		}
	);
})(window.wp);
//#endregion

//#region Auto-expand Padding/Margin controls and unlink values by default
(function() {
	function enableAndExpandSpacingControls() {
		const dimensionsPanel = document.querySelector('.dimensions-block-support-panel');
		if (!dimensionsPanel) return;
		
		const menuButton = dimensionsPanel.querySelector('.components-dropdown-menu__toggle');
		if (!menuButton) return;
		
		const toolsPanelItems = dimensionsPanel.querySelectorAll('.components-tools-panel-item');
		const hasVisibleControls = toolsPanelItems.length > 0 && 
			Array.from(toolsPanelItems).some(item => item.querySelector('button'));
		
		if (!hasVisibleControls && menuButton.getAttribute('aria-expanded') === 'false') {
			menuButton.click();
			
			setTimeout(() => {
				const popover = document.querySelector('.components-dropdown-menu__popover');
				if (popover) {
					popover.style.opacity = '0';
					popover.style.pointerEvents = 'none';
				}
				
				const menuItems = document.querySelectorAll('.components-dropdown-menu__menu .components-menu-item__button[aria-checked="false"]');
				menuItems.forEach(item => {
					item.click();
				});
				
				setTimeout(() => {
					menuButton.click();
					
					setTimeout(() => {
						if (popover) {
							popover.style.opacity = '';
							popover.style.pointerEvents = '';
						}
						unlinkSpacingValues();
					}, 100);
				}, 150);
			}, 50);
		} else if (hasVisibleControls) {
			unlinkSpacingValues();
		}
	}
	
	function unlinkSpacingValues() {
		const spacingControls = document.querySelectorAll('.spacing-sizes-control');
		spacingControls.forEach(control => {
			const linkButton = control.querySelector('.spacing-sizes-control__header button.components-button.has-icon');
			if (linkButton) {
				const svg = linkButton.querySelector('svg path');
				if (svg) {
					const pathD = svg.getAttribute('d');
					if (pathD && pathD.includes('M10 17.389H8.444A5.194')) {
						linkButton.click();
					}
				}
			}
		});
	}
	
	if (wp.data) {
		let lastBlockId = null;
		wp.data.subscribe(() => {
			const selectedBlock = wp.data.select('core/block-editor').getSelectedBlock();
			if (selectedBlock && selectedBlock.clientId !== lastBlockId) {
				lastBlockId = selectedBlock.clientId;
				setTimeout(enableAndExpandSpacingControls, 250);
			}
		});
	}
})();
//#endregion
