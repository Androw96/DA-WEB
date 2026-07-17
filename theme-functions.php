<?php
/**
 * DENT-ART-TECHNIK Theme functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package DENT-ART-TECHNIK
 * @since 1.0
 */

/**
 * Define Constants
 */
define( 'CHILD_THEME_DENT_ART_TECHNIK_VERSION', '1.0' );

/**
 * Enqueue styles
 */
function child_enqueue_styles() {

	wp_enqueue_style( 'dent-art-technik-theme-css', get_stylesheet_directory_uri() . '/style.css', array('astra-theme-css'), CHILD_THEME_DENT_ART_TECHNIK_VERSION, 'all' );

}

add_action( 'wp_enqueue_scripts', 'child_enqueue_styles', 15 );


function dentart_recent_posts_shortcode($atts) {
    ob_start();

    $atts = shortcode_atts(
        array(
            'count' => 3,
        ),
        $atts,
        'recent_posts'
    );

    $query = new WP_Query(array(
        'post_type' => 'post',
        'posts_per_page' => intval($atts['count']),
        'post_status' => 'publish',
    ));

    if ($query->have_posts()) {
        echo '<div class="recent-posts-grid">';
        while ($query->have_posts()) {
            $query->the_post();
            echo '<div class="recent-post-item">';
            if (has_post_thumbnail()) {
                echo '<a href="' . get_permalink() . '">';
                the_post_thumbnail('medium');
                echo '</a>';
            }
            echo '<h3><a href="' . get_permalink() . '">' . get_the_title() . '</a></h3>';
            echo '<p>' . wp_trim_words(get_the_excerpt(), 20, '...') . '</p>';
        }
        echo '</div>';
        wp_reset_postdata();
    }

    return ob_get_clean();
}
add_shortcode('recent_posts', 'dentart_recent_posts_shortcode');



// Gomb hozzáadása a termék oldalhoz
add_action('woocommerce_single_product_summary', 'custom_request_price_button', 21);
function custom_request_price_button() {
    global $product;
    
    // Csak akkor jelenjen meg, ha termékoldalon vagyunk
    if (is_product()) {
        echo '<button id="request-price-button" class="button alt" style="margin-top:20px;">Kérje ajánlatunkat!</button>';
        
        // Rejtett div a formmal
        echo '<div id="price-request-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999;">';
        echo '<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:30px; border-radius:8px; max-width:500px; width:90%; max-height:80vh; overflow-y:auto;">';
        echo '<span id="close-modal" style="position:absolute; top:10px; right:15px; font-size:24px; cursor:pointer; color:#999;">&times;</span>';
        echo '<h3 style="margin-top:0;">Kérje ajánlatunkat!</h3>';
        echo do_shortcode('[wpforms id="27" title="false"]');
        echo '</div>';
        echo '</div>';
    }
}

// JavaScript hozzáadása a footer-hez
add_action('wp_footer', 'price_request_modal_script');
function price_request_modal_script() {
    if (is_product()) {
        ?>
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            const button = document.getElementById('request-price-button');
            const modal = document.getElementById('price-request-modal');
            const closeBtn = document.getElementById('close-modal');
            
            if (button && modal) {
                // Gomb kattintás - modal megjelenítése
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    modal.style.display = 'block';
                    document.body.style.overflow = 'hidden'; // scroll letiltása
                });
                
                // X gomb - modal bezárása
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        modal.style.display = 'none';
                        document.body.style.overflow = 'auto'; // scroll visszaállítása
                    });
                }
                
                // Háttérre kattintás - modal bezárása
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }
                });
                
                // ESC billentyű - modal bezárása
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape' && modal.style.display === 'block') {
                        modal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }
                });
            }
        });
        </script>
        <?php
    }
}

// Opcionális: CSS stílusok finomhangolása
add_action('wp_head', 'price_request_modal_styles');
function price_request_modal_styles() {
    if (is_product()) {
        ?>
        <style>
        #price-request-modal {
            font-family: inherit;
        }
        
        #price-request-modal .wpforms-container {
            margin: 0;
        }
        
        #price-request-modal .wpforms-form {
            padding: 0;
        }
        
        #close-modal:hover {
            color: #333;
        }
        
        /* Mobilon jobb megjelenés */
        @media (max-width: 768px) {
            #price-request-modal > div {
                width: 95%;
                padding: 20px;
                max-height: 90vh;
            }
        }
        </style>
        <?php
    }
}




// ---------------------------------------------------------
// [latest_posts_grid] shortcode – egységes rács, excerpt + dátum
// ---------------------------------------------------------
function lpg_register_shortcode( $atts ) {
    // alapértelmezett attribútumok
    $atts = shortcode_atts( array(
        'count' => 6,
    ), $atts, 'latest_posts_grid' );

    // WP_Query argumentumok
    $args = array(
        'post_type'      => 'post',
        'posts_per_page' => intval( $atts['count'] ),
        'orderby'        => 'date',
        'order'          => 'DESC',
    );

    $q = new WP_Query( $args );
    if ( ! $q->have_posts() ) {
        return '<p>Nincs megjeleníthető bejegyzés.</p>';
    }

    ob_start();
    ?>
    <div class="latest-posts-grid">
      <?php while ( $q->have_posts() ): $q->the_post(); ?>
        <div class="lpg-item">
          <?php if ( has_post_thumbnail() ): ?>
            <a href="<?php the_permalink(); ?>" class="lpg-thumb">
              <?php the_post_thumbnail( 'medium' ); ?>
            </a>
          <?php endif; ?>

          <h3 class="lpg-title">
            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
          </h3>

          <div class="lpg-date"><?php echo get_the_date( 'Y. F j.' ); ?></div>

           <div class="lpg-excerpt">
            <?php
              if ( has_excerpt() ) {
                  echo wp_trim_words( get_the_excerpt(), 20, '…' );
              } else {
                  echo wp_trim_words( get_the_content(), 20, '…' );
              }
            ?>
          </div>

          <a href="<?php the_permalink(); ?>" class="lpg-more">Bővebben…</a>
        </div>
      <?php endwhile; wp_reset_postdata(); ?>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'latest_posts_grid', 'lpg_register_shortcode' );

function custom_menu_shortcode($atts) {
    $atts = shortcode_atts(array(
        'menu' => '', // megadható menü neve
    ), $atts);

    return wp_nav_menu(array(
        'menu' => $atts['menu'],
        'container' => 'div',
        'container_class' => 'custom-sidebar-menu',
        'menu_class' => 'custom-menu-list',
        'echo' => false,
        'walker' => new Walker_Nav_Menu(), // később lecserélhető egyedi walkerre, ha kell
    ));
}
add_shortcode('custom_menu', 'custom_menu_shortcode');





add_filter( 'astra_single_post_navigation', 'astra_change_next_prev_text' );
 
/**
 * Function to change the Next Post/ Previous post text.
 *
 * @param array $args Arguments for next post / previous post links.
 * @return array
 */
function astra_change_next_prev_text( $args ) {
    $next_post = get_next_post();
    $prev_post = get_previous_post();
    $next_text = false;
    if ( $next_post ) {
        $next_text = sprintf(
            '%s <span class="ast-right-arrow">→</span>',
            'Következő hírek'
        );
    }
    $prev_text = false;
    if ( $prev_post ) {
        $prev_text = sprintf(
            '<span class="ast-left-arrow">←</span> %s',
            'Előző hírek'
        );
    }
    $args['next_text'] = $next_text;
    $args['prev_text'] = $prev_text;
    return $args;
}


// Készletállapot mutatása a termékkártyákon (lista nézetben)
add_action('woocommerce_after_shop_loop_item_title', function () {
    global $product;
    if ( ! $product ) return;
    echo wc_get_stock_html( $product ); // pl. "Raktáron" / "Nincs készleten"
}, 11);