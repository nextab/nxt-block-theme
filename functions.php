<?php
#region Clean Up WP Admin Bar
function remove_admin_bar_links() {
	global $wp_admin_bar;
	$wp_admin_bar->remove_menu('wp-logo');          // Remove the Wordpress logo + sub links
	// $wp_admin_bar->remove_menu('site-name');        // Remove the site name menu
	// $wp_admin_bar->remove_menu('view-site');        // Remove the view site link
	// $wp_admin_bar->remove_menu('updates');          // Remove the updates link
	// $wp_admin_bar->remove_menu('comments');         // Remove the comments link
	$wp_admin_bar->remove_menu('new-content');      // Remove the content link
	// $wp_admin_bar->remove_menu('my-account');       // Remove the user details tab
}
add_action( 'wp_before_admin_bar_render', 'remove_admin_bar_links' );
#endregion

#region Replace URL for Logo on Login Screen
function nextab_url_login_logo() {
	return get_bloginfo('wpurl');
}
add_filter('login_headerurl', 'nextab_url_login_logo');
#endregion

#region Change title tag for Login Link
function nextab_login_logo_url_title() {
	return get_bloginfo('name');
}
add_filter('login_headertext', 'nextab_login_logo_url_title');
#endregion

#region Add Widget with Developer Info in WP Dashboard
function nextab_add_dashboard_widgets() {
	wp_add_dashboard_widget('wp_dashboard_widget', 'Designer & Developer Info', 'nextab_theme_info');
}
add_action('wp_dashboard_setup', 'nextab_add_dashboard_widgets');

function nextab_theme_info() {
	echo '<ul>
	<li><strong>Entwickelt von:</strong> <a href="http://www.nextab.de">nexTab.de</a></li>
	<li><strong>E-Mail:</strong> <a href="mailto:info@nextab.de">info@nextab.de</a></li>
	<li><strong>Mobil:</strong> <a href="tel:+491608436001">0160 / 843 6001</a></li>
	</ul>';
}
#endregion

#region Replace Logo on WP Login Screen
add_action('login_head', 'nextab_custom_login_logo');
function nextab_custom_login_logo() {
	$upload_dir = wp_upload_dir();
	echo '<style type="text/css">
	body.login form .forgetmenot { float: none; position: relative; }
	#login form p.submit { text-align: center; float: none; margin-top: 1.25rem; }
	body.login form input[type="text"]:focus, body.login form input[type="password"]:focus, .wp-core-ui .button-primary.focus, .wp-core-ui .button-primary:focus { border: none; box-shadow: none; outline: 1px dashed white; outline-offset: 2px; }
	body.login #backtoblog a, body.login #nav a, body.login a.privacy-policy-link, body.login .dashicons { color: #1f1f1f; }
	h1 a { background-image:url("' . $upload_dir['baseurl'] . '/login-logo.svg") !important; background-size: 320px 74px !important; width: 320px !important; height: 74px !important; margin-bottom: 40px !important; padding-bottom: 0 !important; }
	.login form { margin-top: 10px !important; }
	</style>';
}
#endregion Pimp my login screen

#region Add custom styling to Gutenberg backend editor
function nxt_add_gutenberg_styles() {
	// Nur im Admin-Bereich ausführen (relevant für enqueue_block_assets Hook)
	if ( ! is_admin() ) {
		return;
	}
	
	// Add support for custom styles in Gutenberg editor.
	add_theme_support( 'editor-styles' );

	// Enqueue frontend stylesheet in Gutenberg editor as well as additional styles just for the backend.
	add_editor_style( 'style.css' );
	
	// Zusätzlich Styles explizit für Site Editor laden
	wp_enqueue_style('nxt_editor_styles', get_stylesheet_uri(), [], filemtime(get_stylesheet_directory() . '/style.css'));

	// Add functionality to extend core Gutenberg blocks (allow groups to hide, make details / accordions work, etc.)
	$script_dependencies = ['wp-blocks', 'wp-dom-ready', 'wp-hooks', 'wp-compose', 'wp-block-editor', 'wp-components', 'wp-i18n', 'wp-element'];
	wp_enqueue_script(
		'nxt_hack_core_blocks',
		get_stylesheet_directory_uri() . '/assets/js/hack_core_blocks.js',
		$script_dependencies,
		filemtime(get_stylesheet_directory() . '/assets/js/hack_core_blocks.js'),
		true
	);
}
// Hook für Post/Page Editor
add_action( 'enqueue_block_editor_assets', 'nxt_add_gutenberg_styles' );
// Hook für Site Editor (Template Editor)
add_action( 'enqueue_block_assets', 'nxt_add_gutenberg_styles' );
#endregion Add custom styling to Gutenberg backend editor

#region Enqueue custom styles in frontend
function enqueue_theme_styles() {
	// Enqueue the main stylesheet
	wp_enqueue_style('theme_styles', get_stylesheet_uri(), [], filemtime(get_stylesheet_directory() . '/style.css'), 'all');
	wp_register_script('frontend_scripts', get_stylesheet_directory_uri() . '/assets/js/frontend_scripts.js', false, '', true);
}
add_action('wp_enqueue_scripts', 'enqueue_theme_styles', 999);
#endregion Enqueue custom styles in frontend

#region Enqueue Gutenberg Scripts
add_theme_support( 'custom-spacing' );
add_theme_support( 'border' );
add_theme_support( 'appearance-tools' );
add_theme_support( 'editor-color-palette' );
#endregion Enqueue Gutenberg Scripts

#region Disable WordPress Fluid Spacing Scale
function nxt_disable_fluid_spacing($theme_json) {
	$data = $theme_json->get_data();
	if (isset($data['settings']['spacing']['spacingScale'])) {
		unset($data['settings']['spacing']['spacingScale']);
	}
	if (isset($data['settings']['spacing']['defaultSpacingSizes'])) {
		$data['settings']['spacing']['defaultSpacingSizes'] = false;
	}
	return $theme_json->update_with($data);
}
add_filter('wp_theme_json_data_default', 'nxt_disable_fluid_spacing', 99);
add_filter('wp_theme_json_data_theme', 'nxt_disable_fluid_spacing', 99);
add_filter('wp_theme_json_data_blocks', 'nxt_disable_fluid_spacing', 99);
add_filter('wp_theme_json_data_user', 'nxt_disable_fluid_spacing', 99);

/* function nxt_clear_theme_json_cache() {
	if (function_exists('wp_clean_theme_json_cache')) {
		wp_clean_theme_json_cache();
	}
	delete_transient('global_styles');
	delete_transient('global_styles_svg_filters');
	wp_cache_flush();
}
add_action('after_switch_theme', 'nxt_clear_theme_json_cache');
add_action('wp_update_themes', 'nxt_clear_theme_json_cache'); */
#endregion Disable WordPress Fluid Spacing Scale

#region Change Gutenberg crap behavior when it comes to responsive websites
function add_viewport_meta_tag() {
	echo '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
}
add_action('wp_head', 'add_viewport_meta_tag');
#endregion Change Gutenberg crap behavior when it comes to responsive websites

#region Prevent Thumbnail Generation
function nxt_disable_image_sizes($sizes) {
	// Remove thumbnail and medium sizes
	unset($sizes['thumbnail']);    // 150x150
	unset($sizes['medium']);       // 300x300

	// Keep other sizes
	return $sizes;
}
add_filter('intermediate_image_sizes_advanced', 'nxt_disable_image_sizes');
#endregion Prevent Thumbnail Generation

#region Initialize Blocks
// Simple class autoloader for our blocks
function nxt_autoload_block_classes($class_name) {
    // Only handle our namespace
    if (strpos($class_name, 'Nextab\\Blocks\\') !== 0) {
        return;
    }

    // Convert namespace to file path
    $file_path = str_replace('Nextab\\Blocks\\', '', $class_name);
    $file_path = str_replace('_', '-', $file_path);
    $file_path = strtolower($file_path);
    $file = get_stylesheet_directory() . '/inc/blocks/class-' . $file_path . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
}
spl_autoload_register('nxt_autoload_block_classes');

// Initialize blocks
$blocks_loader = new \Nextab\Blocks\Blocks_Loader();
$blocks_loader->init();

#region Allow .svg files
function nxt_allow_svg($mimes) {
	$mimes['svg'] = 'image/svg+xml';
	return $mimes;
}
add_filter('upload_mimes', 'nxt_allow_svg');

function nxt_really_allow_svg($checked, $file, $filename, $mimes){
	if(!$checked['type']){
		$wp_filetype = wp_check_filetype( $filename, $mimes );
		$ext = $wp_filetype['ext'];
		$type = $wp_filetype['type'];
		$proper_filename = $filename;
		if($type && 0 === strpos($type, 'image/') && $ext !== 'svg'){
			$ext = $type = false;
		}	
		$checked = compact('ext','type','proper_filename');
	}
	return $checked;
}
add_filter('wp_check_filetype_and_ext', 'nxt_really_allow_svg', 10, 4);
#endregion Allow .svg files

#region Redirect non-admins from Dashboard
function nxt_redirect_non_admins_from_dashboard() {
    if (
        is_admin()
        && is_user_logged_in()
        && !current_user_can('administrator')
		&& !(defined('DOING_AJAX') && DOING_AJAX)
    ) {
        wp_safe_redirect(home_url(), 302, 'nxt redirect non admins from dashboard');
        exit;
    }
}
add_action('init', 'nxt_redirect_non_admins_from_dashboard');
#endregion Redirect non-admins from Dashboard

#region Do not show admin bar for non-admins
function nxt_hide_admin_bar_for_non_admins() {
    if (!current_user_can('administrator')) {
        show_admin_bar(false);
    }
}
add_action('after_setup_theme', 'nxt_hide_admin_bar_for_non_admins');
#endregion Do not show admin bar for non-admins

#region Sanitize names of uploaded files
function sanitize_upload_name($filename) {
	$sanitized_filename = remove_accents($filename); // Convert to ASCII

	// Standard replacements
	$invalid = array(
	' ' => '-',
	'%20' => '-',
	'_' => '-',
	);
	$sanitized_filename = str_replace(array_keys($invalid), array_values($invalid), $sanitized_filename);

	// Remove all non-alphanumeric except .
	$sanitized_filename = preg_replace('/[^A-Za-z0-9-\. ]/', '', $sanitized_filename);
	// Remove all but last .
	$sanitized_filename = preg_replace('/\.(?=.*\.)/', '-', $sanitized_filename);
	// Replace any more than one - in a row
	$sanitized_filename = preg_replace('/-+/', '-', $sanitized_filename);
	// Remove last - if at the end
	$sanitized_filename = str_replace('-.', '.', $sanitized_filename);
	// Lowercase
	$sanitized_filename = strtolower($sanitized_filename);
	return $sanitized_filename;
}	
add_filter("sanitize_file_name", "sanitize_upload_name", 10, 1);
#endregion Sanitize names of uploaded files

add_filter('site_status_should_suggest_persistent_object_cache', '__return_false');

#region Harden WordPress Security
// Customize login error messages
function nxt_login_error_message() {
	return 'Die eingegebenen Anmeldedaten sind nicht korrekt.';
}
add_filter('login_errors', 'nxt_login_error_message');

// Remove detailed password reset messages
function nxt_remove_reset_messages($errors) {
	$errors->remove('invalid_email');
	$errors->remove('empty_username');
	$errors->add('invalid_combination', 'Wenn ein Konto mit den angegebenen Daten existiert, erhalten Sie eine E-Mail mit weiteren Anweisungen.');
	return $errors;
}
add_filter('lostpassword_errors', 'nxt_remove_reset_messages');

// Disable user enumeration
function nxt_disable_user_enumeration() {
	// Block author query var
	if (isset($_REQUEST['author']) && !is_admin()) {
		wp_redirect(home_url(), 301);
		exit;
	}
	// Block author URLs
	if (preg_match('/author=([0-9]*)/i', $_SERVER['QUERY_STRING'])) {
		wp_redirect(home_url(), 301);
		exit;
	}

	// Block author feeds
	if (preg_match('/wp-json\/wp\/v2\/users/i', $_SERVER['REQUEST_URI'])) {
		wp_redirect(home_url(), 301);
		exit;
	}

	// Block ALL author archives, regardless of whether they exist
	if (preg_match('/\/author\/.*/', $_SERVER['REQUEST_URI'])) {
		wp_redirect(home_url(), 301);
		exit;
	}
}
add_action('template_redirect', 'nxt_disable_user_enumeration');

// Generic registration error messages
function nxt_registration_privacy($errors) {
	// Clear any existing messages about email or username existence
	$errors->remove('email_exists');
	$errors->remove('username_exists');

	// Add a generic message that's shown for ALL registration attempts
	$errors->add('registration_notice', 'Wenn Sie sich registrieren möchten, erhalten Sie eine E-Mail mit weiteren Anweisungen. Wenn Sie bereits ein Konto haben, nutzen Sie bitte die Anmeldeseite.');

	return $errors;
}
add_filter('registration_errors', 'nxt_registration_privacy');

// Protect AJAX registration checks
function nxt_check_email_privacy() {
	wp_send_json_success(array(
		'msg' => 'Bitte fahren Sie mit der Registrierung fort.'
	));
	exit;
}
add_action('wp_ajax_check_email', 'nxt_check_email_privacy');
add_action('wp_ajax_nopriv_check_email', 'nxt_check_email_privacy');
#endregion Harden WordPress Security

function jahr_callback() {
	return date('Y');
}
add_shortcode('jahr', 'jahr_callback');

function copyright_callback() {
	return '&copy;';
}
add_shortcode('copyright', 'copyright_callback');

#region Shy Shortcode
function shy_shortcode($atts, $content = null) {
	return '&shy;';
}
add_shortcode('shy', 'shy_shortcode');
#endregion Shy Shortcode

#region Taxonomy-based Template Routing (replaces Divi Theme Builder functionality)
/**
 * Taxonomy-based Template Routing
 * 
 * This replaces Divi's Theme Builder "Assign to pages with taxonomy X" feature.
 * 
 * Configure mappings via: Appearance → Template Routing
 */
require_once get_stylesheet_directory() . '/inc/taxonomy-template-routing.php';
#endregion Taxonomy-based Template Routing