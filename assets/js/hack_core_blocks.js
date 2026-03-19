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

//#region Add hide functionality to Group Block and additional functionality to Grid Blocks
(function(wp) {
	const { addFilter } = wp.hooks;
	const { createHigherOrderComponent } = wp.compose;
	const { InspectorAdvancedControls } = wp.blockEditor;
	const { ToggleControl, Notice } = wp.components;
	const NumberControl = wp.components.__experimentalNumberControl ?? wp.components.NumberControl ?? null;
	const { __ } = wp.i18n;
	const { createElement, Fragment, useEffect } = wp.element;

	addFilter(
		'blocks.registerBlockType',
		'core/group-close-button-attribute',
		(settings, name) => {
			if (name !== 'core/group') {
				return settings;
			}

			return {
				...settings,
				attributes: {
					...settings.attributes,
					showCloseButton: {
						type: 'boolean',
						default: false,
					},
					boxShadow: {
						type: 'boolean',
						default: false,
					},
					thriveProductIds: {
						type: 'string',
						default: '',
					},
					gridAutoFit: {
						type: 'boolean',
						default: false,
					},
					gridMaxColumns: {
						type: 'number',
						default: 0,
					},
				},
			};
		}
	);

	const withInspectorControl = createHigherOrderComponent((BlockEdit) => {
		return (props) => {
			if (props.name !== 'core/group') {
				return createElement(BlockEdit, props);
			}

			const { attributes, setAttributes, clientId } = props;
			const { showCloseButton, anchor, thriveProductIds, boxShadow, gridAutoFit, gridMaxColumns, layout } = attributes;
			const isGridLayout = layout?.type === 'grid';
			const minWidth = layout?.minimumColumnWidth ?? '250px';

			useEffect(() => {
				if (!isGridLayout) return;
				if (!gridAutoFit && !gridMaxColumns) return;

				requestAnimationFrame(() => {
					const blockEl = document.querySelector(`[data-block="${clientId}"]`);
					if (!blockEl) return;

					const fillMode = gridAutoFit ? 'auto-fit' : 'auto-fill';

					if (gridMaxColumns > 0) {
						blockEl.style.gridTemplateColumns = `repeat(${fillMode}, minmax(max(min(${minWidth}, 100%), calc(100% / ${gridMaxColumns})), 1fr))`;
					} else {
						const current = blockEl.style.gridTemplateColumns;
						if (current && current.includes('auto-fill')) {
							blockEl.style.gridTemplateColumns = current.replace('auto-fill', 'auto-fit');
						}
					}
				});
			}, [gridAutoFit, gridMaxColumns, isGridLayout, clientId, minWidth]);

			return createElement(
				Fragment,
				null,
				createElement(BlockEdit, props),
				createElement(
					InspectorAdvancedControls,
					null,
					isGridLayout && createElement(ToggleControl, {
						label: __('Grid: auto-fit statt auto-fill'),
						help: __('Zentriert Elemente wenn sie nicht die gesamte Breite füllen.'),
						checked: gridAutoFit,
						onChange: (value) => setAttributes({ gridAutoFit: value }),
					}),
					isGridLayout && NumberControl && createElement(
						'div',
						{ style: { marginBottom: '16px' } },
						createElement(NumberControl, {
							label: __('Grid: Max. Spaltenanzahl'),
							help: __('0 = kein Limit. Verhindert, dass wenige Elemente zu breit werden.'),
							value: gridMaxColumns,
							min: 0,
							onChange: (value) => setAttributes({ gridMaxColumns: parseInt(value, 10) || 0 }),
						})
					),
					createElement(ToggleControl, {
						label: __('Show Close Button'),
						checked: showCloseButton,
						onChange: (value) => setAttributes({ showCloseButton: value }),
					}),
					createElement(ToggleControl, {
						label: __('Add Box Shadow'),
						checked: boxShadow,
						onChange: (value) => setAttributes({ boxShadow: value }),
					}),
					createElement('div', { style: { marginBottom: '16px' } },
						createElement(wp.components.TextControl, {
							label: __('Thrive Product IDs'),
							help: __('Enter comma-separated product IDs'),
							value: thriveProductIds,
							onChange: (value) => setAttributes({ thriveProductIds: value }),
						})
					),
					showCloseButton && !anchor && createElement(
						Notice,
						{
							status: 'warning',
							isDismissible: false,
						},
						__('Please set a CSS ID for this block to enable the close button functionality.')
					)
				)
			);
		};
	}, 'withInspectorControl');

	addFilter(
		'editor.BlockEdit',
		'core/group-close-button-inspector-control',
		withInspectorControl
	);

	addFilter(
		'blocks.getSaveContent.extraProps',
		'core/group-close-button-save',
		(extraProps, blockType, attributes) => {
			if (blockType.name !== 'core/group') {
				return extraProps;
			}

			let className = extraProps.className || '';

			if (attributes.showCloseButton) {
				className += ' has-close-button';
			}
			if (attributes.boxShadow) {
				className += ' box-shadow';
			}
			if (attributes.gridAutoFit) {
				className += ' is-grid-auto-fit';
			}
			if (attributes.gridMaxColumns > 0) {
				extraProps['data-grid-max-columns'] = String(attributes.gridMaxColumns);
				extraProps['data-grid-min-width'] = attributes.layout?.minimumColumnWidth ?? '250px';
			}

			extraProps.className = className.trim();
			return extraProps;
		}
	);
})(window.wp);
//#endregion Add hide functionality to Group Block and additional functionality to Grid Blocks