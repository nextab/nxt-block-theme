<?php
/**
 * Call to Action Block
 *
 * @package NexTabBlockTheme
 * @subpackage Blocks
 */

namespace Nextab\Blocks;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Class Call_To_Action
 * 
 * Handles the rendering and functionality of the Call to Action block
 */
class Call_To_Action {
    /**
     * Initialize the block
     *
     * @return void
     */
    public function init() {
        add_action('init', [$this, 'register_block']);
    }

    /**
     * Register the block with Gutenberg
     *
     * @return void
     */
	public function register_block() {
		register_block_type('nxt/call-to-action', [
			'editor_script' => 'nxt-call-to-action',
			'attributes' => [
				'ctaTitle' => [
					'type' => 'string',
					'default' => ''
				],
				'ctaContent' => [
					'type' => 'string',
					'default' => ''
				],
				'buttonText' => [
					'type' => 'string',
					'default' => ''
				],
				'buttonLink' => [
					'type' => 'string',
					'default' => ''
				],
				'buttonTarget' => [
					'type' => 'boolean',
					'default' => false
				],
				'fullWidth' => [
					'type' => 'boolean',
					'default' => false
				],
				'textAlignLeft' => [
					'type' => 'boolean',
					'default' => false
				],
				'headlineFontSize' => [
					'type' => 'string',
					'default' => 'h4-font-size'
				],
				'contentFontSize' => [
					'type' => 'string',
					'default' => 'medium'
				],
				'className' => [
					'type' => 'string',
					'default' => ''
				]
			],
		]);
	}
}