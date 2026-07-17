jQuery(document).ready(function($) {
	if (typeof surbma_hc_data != 'undefined') {
		function handlePostcodeCity(type) {
			const $postcodeField = $(`.woocommerce-page #${type}_postcode`);
			const $cityField = $(`.woocommerce-page #${type}_city`);
			
			if (!$postcodeField.length) return;
			
			let cityFieldTouched = false;
			let processingClick = false; // Flag to prevent multiple processing

			// Disable WooCommerce's event handlers for postcode fields only
			window.setTimeout(function() {
				// Completely unbind all events from postcode field that might interfere
				$postcodeField.off();
				
				// Re-bind necessary handlers manually
				$postcodeField.on('blur input change focusout keyup', postcodeHandler);
				
				// Remove WooCommerce's queue_update_checkout handler from all relevant fields
				$('form.checkout').off('input keydown change', '.address-field input.input-text, .update_totals_on_change input.input-text');
				
				// Re-bind handler for all other fields (excluding postcode)
				$('form.checkout').on('input keydown change', 
					'.address-field input.input-text:not(#billing_postcode, #shipping_postcode), .update_totals_on_change input.input-text:not(#billing_postcode, #shipping_postcode)', 
					function() {
						$('body').trigger('update_checkout');
					}
				);
			}, 100); // Increased timeout to ensure WooCommerce has set up its handlers

			// Add position relative to the city field's parent element
			$cityField.parent().css('position', 'relative');
			$cityField.parent().css('display', 'block');

			// Create tooltip container
			const $tooltip = $('<div>', {
				class: 'city-tooltip',
				css: {
					display: 'none',
					position: 'absolute',
					backgroundColor: 'white',
					border: '1px solid #ddd',
					borderRadius: '4px',
					padding: '8px',
					boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
					zIndex: 1000,
					maxHeight: '200px',
					overflowY: 'auto',
					width: $cityField.outerWidth() + 'px'
				}
			}).insertAfter($cityField);

			// Style for city options
			const optionStyle = {
				padding: '4px 8px',
				cursor: 'pointer',
				borderBottom: '1px solid #eee'
			};

			// Add hover effect for options
			$('<style>')
				.text(`
					.city-tooltip .city-option:hover {
						background-color: #f5f5f5;
					}
					.city-tooltip .city-option:last-child {
						border-bottom: none;
					}
				`)
				.appendTo('head');

			// If city is manually added, don't change it
			$cityField.on('keyup change', function() {
				cityFieldTouched = true;
			});

			// Close tooltip when clicking outside or focusing on another field
			$(document).on('click focusin', function(e) {
				if (!$(e.target).closest('.city-tooltip').length && !$(e.target).is($cityField)) {
					$tooltip.hide();
				}
			});

			// Handler function for postcode field
			function postcodeHandler() {
				if (processingClick) return; // Skip if we're already processing a click
				
				const postcode = $postcodeField.val();
				const cities = surbma_hc_data[postcode];
				
				if (postcode.length === 4 && cities && ($cityField.val() === '' || !cityFieldTouched)) {
					if (cities.length === 1) {
						// If there's only one city, set it directly
						$cityField.val(cities[0]);
						$tooltip.hide();
						updateCityValidation();
					} else {
						// If there are multiple cities, show the tooltip
						updateTooltip(cities);

						// Clear the text field if it doesn't match any city in the list
						if (!cities.includes($cityField.val())) {
							$cityField.val('');
						}
					}
					
					// Handle validation classes
					updateCityValidation();
					
					// Only trigger update_checkout if the city field has a value
					if ($cityField.val() !== '') {
						triggerUpdateCheckout();
					}
				} else {
					$tooltip.hide();
				}
			}
			
			// Function to update tooltip with city options
			function updateTooltip(cities) {
				$tooltip.empty();
				
				// Add a header
				$('<div>', {
					text: 'Település választása:',
					css: {
						fontWeight: 'bold',
						marginBottom: '8px',
						padding: '0 8px'
					}
				}).appendTo($tooltip);

				// Add city options with enhanced click handler
				cities.forEach(city => {
					$('<div>', {
						class: 'city-option',
						text: city,
						css: optionStyle,
						mousedown: function(e) { // Using mousedown instead of click
							e.preventDefault();
							e.stopPropagation();
							
							processingClick = true;
							
							// Set the city value immediately
							$cityField.val(city);
							cityFieldTouched = true;
							
							// Hide tooltip immediately
							$tooltip.hide();
							
							// Focus the city field
							$cityField.focus();
							
							// Update validation
							updateCityValidation();
							
							// Force trigger events in a specific sequence with timeouts
							setTimeout(function() {
								$cityField.trigger('change');
								
								setTimeout(function() {
									// Force blur from postcode field
									$postcodeField.blur();
									
									// Move focus elsewhere (to a safe element)
									$('body').focus();
									
									// Trigger update checkout
									triggerUpdateCheckout();
									
									// Reset processing flag
									processingClick = false;
								}, 50);
							}, 50);
						}
					}).appendTo($tooltip);
				});

				// Position and show tooltip
				const tooltipTop = $cityField.outerHeight() + 5;
				$tooltip.css({
					top: tooltipTop,
					left: 0
				}).show();
			}
			
			// Function to update city field validation classes
			function updateCityValidation() {
				if ($cityField.val() !== '') {
					const $cityFieldWrapper = $(`.woocommerce-checkout #${type}_city_field`);
					$cityFieldWrapper.removeClass('woocommerce-invalid woocommerce-invalid-required-field');
					$cityFieldWrapper.addClass('woocommerce-validated');
				}
			}
			
			// Function to trigger update checkout with delay
			function triggerUpdateCheckout() {
				setTimeout(function() {
					$('body').trigger('update_checkout');
				}, 200);
			}

			// Show tooltip when city field is active and there are multiple options
			$cityField.on('click focus', function() {
				const postcode = $postcodeField.val();
				const cities = surbma_hc_data[postcode];
				
				if (cities && cities.length > 1) {
					updateTooltip(cities);
				}
			});
		}

		// Initialize handlers for both billing and shipping
		['billing', 'shipping'].forEach(type => handlePostcodeCity(type));
	}
});