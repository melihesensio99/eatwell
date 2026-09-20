# EatWell frontend prototype

Mobile-first Turkish interface for the existing ASP.NET Core .NET 9 backend.

The preview uses realistic mock data. `app.js` contains the API map and a centralized `apiFetch()` wrapper; when Firebase is configured it obtains the current ID token and sends `Authorization: Bearer {firebase_id_token}`. Fill in `config.js` using `config.example.js`. No service-account secrets belong in the browser.

Connected mutations: add water (`POST /api/daily-logs/water`), add food (`POST /api/daily-logs/items`), delete food (`DELETE /api/daily-logs/items/{itemId}`), and profile save (`PUT /api/profile`). The UI falls back to demo state until a real API URL and Firebase Web config are supplied.
