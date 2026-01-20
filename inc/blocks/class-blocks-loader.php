<?php
/**
 * Blocks Loader Class
 *
 * @package NexTabBlockTheme
 * @subpackage Blocks
 */

namespace Nextab\Blocks;

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly
}

/**
 * Class Blocks_Loader
 * 
 * Handles the registration and initialization of all custom blocks
 */
class Blocks_Loader {
	/**
	 * Initialize the blocks loader
	 *
	 * @return void
	 */
	public function init() {
		add_action('init', [$this, 'register_blocks']);
		add_action('enqueue_block_editor_assets', [$this, 'enqueue_block_assets']);
	}

	/**
	 * Register all custom blocks
	 * 
	 * Note: Some blocks are JavaScript-only (registered via JS files)
	 * and don't need PHP class initialization. Only blocks with
	 * server-side rendering need PHP classes.
	 *
	 * @return void
	 */
	public function register_blocks() {
		// Initialize blocks with PHP backend (server-side rendering)
		$info_box = new Info_Box();
		$call_to_action = new Call_To_Action();

		$info_box->init();
		$call_to_action->init();
	}

	/**
	 * Get file version (filemtime with fallback)
	 * 
	 * @param string $file_path Full path to file
	 * @return string|int Version string or timestamp
	 */
	private function get_file_version(string $file_path) {
		if (file_exists($file_path)) {
			return filemtime($file_path);
		}
		return '1.0.0';
	}

	/**
	 * Enqueue block assets
	 *
	 * @return void
	 */
	public function enqueue_block_assets() {
		$blocks_js_path = get_stylesheet_directory() . '/assets/js/blocks/';
		$blocks_js_uri = get_stylesheet_directory_uri() . '/assets/js/blocks/';

		// Core blocks (recommended to keep)
		wp_register_script(
			'nxt-call-to-action',
			$blocks_js_uri . 'nxt-call-to-action.js',
			['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components'],
			$this->get_file_version($blocks_js_path . 'nxt-call-to-action.js'),
			true
		);

		wp_register_script(
			'nxt-info-box',
			$blocks_js_uri . 'nxt-info-box.js',
			['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-server-side-render'],
			$this->get_file_version($blocks_js_path . 'nxt-info-box.js'),
			true
		);

		// Enqueue scripts in admin
		if (is_admin()) {
			wp_enqueue_script('nxt-call-to-action');
			wp_enqueue_script('nxt-info-box');
		}
	}
}
