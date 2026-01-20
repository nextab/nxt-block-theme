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