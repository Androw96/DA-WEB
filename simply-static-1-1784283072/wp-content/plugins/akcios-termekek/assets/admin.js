jQuery(document).ready(function($) {
    // Színválasztók inicializálása
    $('.atp-color-picker').wpColorPicker({
        change: function() {
            atpUpdatePreview();
        }
    });
    
    // Sliderek kezelése
    $('.atp-slider').on('input', function() {
        var value = $(this).val();
        var unit = $(this).data('unit') || '';
        $(this).siblings('.atp-slider-value').text(value + unit);
        atpUpdatePreview();
    });
    
    // Élő előnézet frissítése
    function atpUpdatePreview() {
        clearTimeout(window.atpPreviewTimeout);
        window.atpPreviewTimeout = setTimeout(function() {
            var formData = $('#atp-settings-form').serialize();
            
            $.ajax({
                url: atpAjax.url,
                type: 'POST',
                data: {
                    action: 'atp_preview_shortcode',
                    nonce: atpAjax.nonce,
                    settings: getFormSettings()
                },
                beforeSend: function() {
                    $('#atp-live-preview').html('<div class="atp-loading">Előnézet frissítése...</div>');
                },
                success: function(response) {
                    if (response.success) {
                        $('#atp-live-preview').html(response.data);
                    } else {
                        $('#atp-live-preview').html('<div class="atp-error">Előnézet hiba</div>');
                    }
                }
            });
        }, 500);
    }
    
    // Form adatok összegyűjtése
    function getFormSettings() {
        var settings = {};
        $('#atp-settings-form').find('input, select, textarea').each(function() {
            var name = $(this).attr('name');
            if (name && name.startsWith('atp_settings[')) {
                var key = name.replace('atp_settings[', '').replace(']', '');
                if ($(this).is(':checkbox')) {
                    settings[key] = $(this).is(':checked') ? 1 : 0;
                } else {
                    settings[key] = $(this).val();
                }
            }
        });
        return settings;
    }
    
    // Előnézet trigger események
    $('.atp-preview-trigger').on('change input', function() {
        atpUpdatePreview();
    });
    
    // Manual előnézet frissítés
    $('#atp-refresh-preview').on('click', function() {
        atpUpdatePreview();
    });
    
    // Export funkció
    $('#atp-export-btn').on('click', function() {
        var form = $('<form>', {
            method: 'POST',
            action: atpAjax.url,
            target: '_blank'
        });
        
        form.append($('<input>', {type: 'hidden', name: 'action', value: 'atp_export_settings'}));
        form.append($('<input>', {type: 'hidden', name: 'nonce', value: atpAjax.nonce}));
        
        $('body').append(form);
        form.submit();
        form.remove();
    });
    
    // Import funkció
    $('#atp-import-btn').on('click', function() {
        $('#atp-import-file').click();
    });
    
    $('#atp-import-file').on('change', function() {
        var file = this.files[0];
        if (!file) return;
        
        var formData = new FormData();
        formData.append('action', 'atp_import_settings');
        formData.append('nonce', atpAjax.nonce);
        formData.append('import_file', file);
        
        $.ajax({
            url: atpAjax.url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    alert('Beállítások sikeresen importálva! Az oldal újratöltése...');
                    location.reload();
                } else {
                    alert('Import hiba: ' + response.data);
                }
            }
        });
    });
    
    // Reset alapértelmezett
    $('#atp-reset-btn').on('click', function() {
        if (confirm('Biztosan visszaállítja az alapértelmezett beállításokat?')) {
            // Alapértelmezett értékek beállítása
            $('input[name="atp_settings[text1]"]').val('AKCIÓ 20%');
            $('input[name="atp_settings[text2]"]').val('AKCIÓ 30%');
            $('input[name="atp_settings[subtext1]"]').val('LIMITÁLT IDEJŰ');
            $('input[name="atp_settings[subtext2]"]').val('KÜLÖNLEGES AJÁNLAT');
            $('input[name="atp_settings[main_color]"]').wpColorPicker('color', '#00b085');
            $('input[name="atp_settings[sub_color]"]').wpColorPicker('color', '#ffffff');
            $('input[name="atp_settings[bg_color]"]').wpColorPicker('color', '#f0f0f0');
            $('input[name="atp_settings[main_size]"]').val('2.5').trigger('input');
            $('input[name="atp_settings[sub_size]"]').val('0.9').trigger('input');
            $('input[name="atp_settings[border_radius]"]').val('8').trigger('input');
            $('input[name="atp_settings[enable_shadow]"]').prop('checked', true);
            $('input[name="atp_settings[text_position]"][value="top-right"]').prop('checked', true);
            
            atpUpdatePreview();
        }
    });
    
    // Shortcode másolás
    $('.atp-copy-shortcode').on('click', function() {
        var text = $(this).data('clipboard-text');
        navigator.clipboard.writeText(text).then(function() {
            alert('Shortcode másolva a vágólapra!');
        });
    });
    
    // Pozíció grid stílus
    $('.atp-position-grid').css({
        'display': 'grid',
        'grid-template-columns': 'repeat(3, 1fr)',
        'gap': '10px',
        'max-width': '300px'
    });
    
    $('.atp-position-option').css({
        'display': 'block',
        'padding': '10px',
        'border': '2px solid #ddd',
        'border-radius': '4px',
        'text-align': 'center',
        'cursor': 'pointer',
        'transition': 'all 0.3s ease'
    });
    
    $('.atp-position-option input[type="radio"]:checked').parent().css({
        'border-color': '#0073aa',
        'background-color': '#f0f8ff'
    });
    
    // Kezdeti előnézet betöltése
    atpUpdatePreview();
});

// Global funkciók
function atpQuickPreview() {
    if (jQuery('#atp-live-preview').length) {
        jQuery('html, body').animate({
            scrollTop: jQuery('#atp-live-preview').offset().top - 100
        }, 500);
    }
}