document.addEventListener('DOMContentLoaded', function() {
	let body = document.body;
	let hasScrolled = false;

	// Add 'scrolled' class to body on scroll
	window.addEventListener('scroll', function() {
		if (!hasScrolled) {
			body.classList.add('scrolled');
			hasScrolled = true;
		}
	}, { passive: true });

	// Remove 'scrolled' class from body when at the top
	window.addEventListener('scroll', function() {
		if (window.scrollY === 0) {
			body.classList.remove('scrolled');
			hasScrolled = false;
		}
	}, { passive: true });

});

//#region Grid auto-fit / max-columns for Group Blocks
(function() {
	function modifyGridRule(el, transform) {
		const classes = Array.from(el.classList);
		Array.from(document.styleSheets).forEach(function(sheet) {
			try {
				Array.from(sheet.cssRules ?? []).forEach(function(rule) {
					if (!(rule instanceof CSSStyleRule)) return;
					const colValue = rule.style.getPropertyValue('grid-template-columns');
					if (!colValue) return;
					if (!classes.some(function(cls) { return rule.selectorText.includes('.' + cls); })) return;
					const newValue = transform(colValue);
					if (newValue !== colValue) {
						rule.style.setProperty('grid-template-columns', newValue);
					}
				});
			} catch(e) {}
		});
	}

	// Max-columns blocks: rebuild the grid-template-columns value from scratch.
	// Also handles auto-fit when the attribute is set alongside max-columns.
	document.querySelectorAll('[data-grid-max-columns]').forEach(function(el) {
		const maxCols = parseInt(el.dataset.gridMaxColumns, 10);
		const minWidth = el.dataset.gridMinWidth ?? '250px';
		const fillMode = el.classList.contains('is-grid-auto-fit') ? 'auto-fit' : 'auto-fill';

		modifyGridRule(el, function() {
			return `repeat(${fillMode}, minmax(max(min(${minWidth}, 100%), calc(100% / ${maxCols})), 1fr))`;
		});
	});

	// Auto-fit only (no max-columns): replace auto-fill with auto-fit in the existing rule.
	document.querySelectorAll('.is-grid-auto-fit:not([data-grid-max-columns])').forEach(function(el) {
		modifyGridRule(el, function(colValue) {
			return colValue.replace('auto-fill', 'auto-fit');
		});
	});
})();
//#endregion Grid auto-fit / max-columns for Group Blocks

//#region Accordions
class Accordion {
	constructor(el) {
		// Store the <details> element
		this.el = el;
		// Store the <summary> element
		this.summary = el.querySelector('summary');
		// Store the <div class="content"> element
		this.content = el.querySelector('.sub-menu, .wp-block-group');
		
		// Store the animation object (so we can cancel it if needed)
		this.animation = null;
		// Store if the element is closing
		this.isClosing = false;
		// Store if the element is expanding
		this.isExpanding = false;
		// Detect user clicks on the summary element
		this.summary.addEventListener('click', (e) => this.onClick(e));
		// Add padding to account for border spacing
		this.padding = 36;
		this.paddingOpen = 55;

		// Handle browser find-in-page opening a closed accordion without a click event
		this.observer = new MutationObserver(() => {
			if (this.el.open && !this.isExpanding && !this.isClosing) {
				const innerContent = this.el.querySelector('.wp-block-group');
				if (innerContent) {
					innerContent.style.transition = 'opacity 0.3s';
					innerContent.style.opacity = '1';
				}
			}
		});
		this.observer.observe(this.el, { attributes: true, attributeFilter: ['open'] });
	}
	
	onClick(e) {
		// Stop default behaviour from the browser
		e.preventDefault();
		// Add an overflow on the <details> to avoid content overflowing
		this.el.style.overflow = 'hidden';
		// Check if the element is being closed or is already closed
		if (this.isClosing || !this.el.open) {
			this.open();
			// Check if the element is being openned or is already open
		} else if (this.isExpanding || this.el.open) {
			this.shrink();
		}
	}
	
	shrink() {
		// Set the element as "being closed"
		this.isClosing = true;
		
		const innerContent = this.el.querySelector('.wp-block-group');
		if (innerContent) {
			innerContent.style.opacity = '0';
			innerContent.style.transition = 'opacity 0.1s';
		}

		const startHeight = `${this.el.offsetHeight + this.padding}px`;
		const endHeight = `${this.summary.offsetHeight + this.padding}px`;
		
		// If there is already an animation running
		if (this.animation) {
			// Cancel the current animation
			this.animation.cancel();
		}
		
		// Start a WAAPI animation
		this.animation = this.el.animate({
			// Set the keyframes from the startHeight to endHeight
			height: [startHeight, endHeight]
		}, {
			duration: 400,
			easing: 'ease-out'
		});
		
		// When the animation is complete, call onAnimationFinish()
		this.animation.onfinish = () => this.onAnimationFinish(false);
		// If the animation is cancelled, isClosing variable is set to false
		this.animation.oncancel = () => this.isClosing = false;
	}
	
	open() {
		// Apply a fixed height on the element
		this.el.style.height = `${this.el.offsetHeight}px`;
		// Force the [open] attribute on the details element
		this.el.open = true;
		// Wait for the next frame to call the expand function
		window.requestAnimationFrame(() => this.expand());
	}
	
	expand() {
		// Set the element as "being expanding"
		this.isExpanding = true;
		const innerContent = this.el.querySelector('.wp-block-group');
		if (innerContent) {
			innerContent.style.opacity = '1';
			// innerContent.style.transition = 'opacity 0.1s';
		}
		// Get the current fixed height of the element
		const startHeight = `${this.el.offsetHeight}px`;
		// Calculate the open height of the element (summary height + content height)
		const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight + this.paddingOpen}px`;
		
		// If there is already an animation running
		if (this.animation) {
			// Cancel the current animation
			this.animation.cancel();
		}
		
		// Start a WAAPI animation
		this.animation = this.el.animate({
			// Set the keyframes from the startHeight to endHeight
			height: [startHeight, endHeight]
		}, {
			duration: 400,
			easing: 'ease-out'
		});
		// When the animation is complete, call onAnimationFinish()
		this.animation.onfinish = () => this.onAnimationFinish(true);
		// If the animation is cancelled, isExpanding variable is set to false
		this.animation.oncancel = () => this.isExpanding = false;
	}
	
	onAnimationFinish(open) {
		// Set the open attribute based on the parameter
		this.el.open = open;
		// Clear the stored animation
		this.animation = null;
		// Reset isClosing & isExpanding
		this.isClosing = false;
		this.isExpanding = false;
		// Remove the overflow hidden and the fixed height
		this.el.style.height = this.el.style.overflow = '';
	}
}

document.querySelectorAll('details').forEach((el) => {
	new Accordion(el);
});
//#endregion Accordions