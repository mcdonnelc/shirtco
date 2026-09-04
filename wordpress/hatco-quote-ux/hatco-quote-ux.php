<?php
/**
 * Plugin Name: Hat.co Quote UX
 * Description: Mobile-first usability enhancements for Hat.co's Gravity Forms quote flow.
 * Version: 0.2.0
 * Author: Shirt.Co
 * Text Domain: hatco-quote-ux
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Limit the enhancement bundle to the two Hat.co staging quote pages.
 */
function hatco_quote_ux_is_target_page(): bool
{
    return is_page(array('get-a-quote', 'get-a-quote-new-layout'));
}

/**
 * Load after the child theme so these focused rules can repair the existing form.
 */
function hatco_quote_ux_enqueue_assets(): void
{
    if (!hatco_quote_ux_is_target_page()) {
        return;
    }

    $plugin_url = plugin_dir_url(__FILE__);
    $plugin_path = plugin_dir_path(__FILE__);

    wp_enqueue_style(
        'hatco-quote-ux',
        $plugin_url . 'assets/quote-ux.css',
        array(),
        (string) filemtime($plugin_path . 'assets/quote-ux.css')
    );

    wp_enqueue_script(
        'hatco-quote-color-utils',
        $plugin_url . 'assets/color-utils.js',
        array(),
        (string) filemtime($plugin_path . 'assets/color-utils.js'),
        true
    );

    wp_enqueue_script(
        'hatco-quote-ux',
        $plugin_url . 'assets/quote-ux.js',
        array('hatco-quote-color-utils'),
        (string) filemtime($plugin_path . 'assets/quote-ux.js'),
        true
    );
}
add_action('wp_enqueue_scripts', 'hatco_quote_ux_enqueue_assets', 30);

/**
 * Add a stable body class for tightly scoped styling.
 *
 * @param string[] $classes Existing body classes.
 * @return string[]
 */
function hatco_quote_ux_body_class(array $classes): array
{
    if (hatco_quote_ux_is_target_page()) {
        $classes[] = 'hatco-quote-ux';
    }

    return $classes;
}
add_filter('body_class', 'hatco_quote_ux_body_class');
