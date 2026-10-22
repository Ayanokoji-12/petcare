
(function () {
    "use strict";

    const API_BASE_URL = "https://petcare-plus.onrender.com";

    const fetchOriginal = window.fetch.bind(window);

    window.fetch = function (recurso, opciones) {
        if (
            typeof recurso === "string" &&
            recurso.startsWith("/api/")
        ) {
            recurso = API_BASE_URL + recurso;
        }

        return fetchOriginal(recurso, opciones);
    };

    window.PETCARE_API_URL = API_BASE_URL;
})();
