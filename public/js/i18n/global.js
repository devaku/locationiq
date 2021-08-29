jQuery(function ($) {
    $.i18n()
        .load({
            en: `${window.location.href}/js/i18n/languages/en.json`,
            ru: `${window.location.href}/js/i18n/languages/ru.json`,
        })
        .done(function () {
            // console.log(window.location.href);
            $('html').i18n();
        });
});
