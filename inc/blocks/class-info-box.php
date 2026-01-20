<?php
/**
 * Info Box Block
 *
 * @package NexTabBlockTheme
 * @subpackage Blocks
 */

namespace Nextab\Blocks;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Class Info_Box
 * 
 * Handles the rendering and functionality of the Info Box block
 */
class Info_Box {
	/**
	 * Initialize the block
	 *
	 * @return void
	 */
	public function init() {
		$this->register_block();
	}

    /**
     * Register the block with Gutenberg
     *
     * @return void
     */
	public function register_block() {
		register_block_type('nxt/info-box', [
			'api_version' => 2,
			'editor_script' => 'nxt-info-box',
			'attributes' => [
				'boxStyle' => [
					'type' => 'string',
					'default' => 'default'
				],
				'title' => [
					'type' => 'string',
					'default' => ''
				],
				'content' => [
					'type' => 'string',
					'default' => ''
				],
				'iconUrl' => [
					'type' => 'string',
					'default' => ''
				],
				'iconAlt' => [
					'type' => 'string',
					'default' => ''
				],
				'alignment' => [
					'type' => 'string',
					'default' => 'left'
				],
				'backgroundColor' => [
					'type' => 'string',
					'default' => ''
				],
				'textColor' => [
					'type' => 'string',
					'default' => ''
				],
				'className' => [
					'type' => 'string',
					'default' => ''
				]
			],
			'render_callback' => [$this, 'render'],
			'supports' => [
				'align' => true,
				'html' => false,
				'spacing' => [
					'margin' => true,
					'padding' => true
				],
				'color' => [
					'background' => true,
					'text' => true,
					'link' => false
				]
			]
		]);
	}

    /**
     * Render the block content
     *
     * @param array $attributes Block attributes
     * @return string
     */
	public function render($attributes, $content = '') {
		$box_style = $attributes['boxStyle'] ?? 'default';
		$title = $attributes['title'] ?? '';
		$text_content = $attributes['content'] ?? '';
		$icon_url = $attributes['iconUrl'] ?? '';
		$icon_alt = $attributes['iconAlt'] ?? '';
		$alignment = $attributes['alignment'] ?? 'left';
		$background_color = $attributes['backgroundColor'] ?? '';
		$text_color = $attributes['textColor'] ?? '';

		$classes = ['wp-block-nxt-info-box', 'nxt-info-box'];
		$classes[] = 'style-' . sanitize_html_class($box_style);
		$classes[] = 'align-' . sanitize_html_class($alignment);

		if (!empty($attributes['className'])) {
			$classes[] = $attributes['className'];
		}

		$styles = [];
		if ($background_color) {
			$styles[] = 'background-color: ' . sanitize_hex_color($background_color);
		}
		if ($text_color) {
			$styles[] = 'color: ' . sanitize_hex_color($text_color);
		}

		$style_attr = !empty($styles) ? ' style="' . esc_attr(implode('; ', $styles)) . '"' : '';

		$output = sprintf(
			'<div class="%s"%s>',
			esc_attr(implode(' ', $classes)),
			$style_attr
		);

		if ($icon_url) {
			$output .= sprintf(
				'<img src="%s" alt="%s" class="info-box-icon" />',
				esc_url($icon_url),
				esc_attr($icon_alt)
			);
		} else {
			$output .= $this->get_icon($box_style);
		}

		$output .= '<div class="info-box-content">';
		
		if ($title) {
			$output .= sprintf(
				'<h3 class="info-box-title">%s</h3>',
				wp_kses_post($title)
			);
		}

		if ($text_content) {
			$output .= sprintf(
				'<div class="info-box-text">%s</div>',
				wp_kses_post($text_content)
			);
		}

		$output .= '</div></div>';

		return $output;
	}

    /**
     * Get icon SVG for info box type
     *
     * @param string $type Info box type
     * @return string
     */
	private function get_icon($box_style) {
		$icons = [
			'default' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
			</svg>',
			'info' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
			</svg>',
			'warning' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
				<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
			</svg>',
			'success' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
			</svg>',
			'error' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
			</svg>'
		];

		return sprintf(
			'<div class="info-box-icon">%s</div>',
			$icons[$box_style] ?? $icons['default']
		);
	}
}