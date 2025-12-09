const apiTemperatureCelsius = document.getElementById("weather-in-celsius");
const apiTemperatureFahrenheit = document.getElementById("weather-in-fahrenheit");
const apiWeatherDescription = document.querySelector(".api-weather-description");
const apiWeatherEmoji = document.getElementById("weather-icon");
const weatherTypeSelect = document.getElementById("weather-type"); 
const cityInput = document.getElementById("location-city");
const getWeatherButton = document.getElementById("get-weather");

getWeatherButton.addEventListener("click", async (e) => {
    const cityName = cityInput.value.trim();

    if (!cityName) {
        resetValues();
        return;
    }

    try {
        const response = await fetch(`/M00988347/weather/${encodeURIComponent(cityName)}`);
        const data = await response.json();

        if (data.success) {
            const weather = data.weatherData;

            apiTemperatureCelsius.value = weather.tempC;
            apiTemperatureFahrenheit.value = (weather.tempC * 9/5 + 32).toFixed(1);

            const description = weather.description.toLowerCase();

            let matched = false;
            for (const option of weatherTypeSelect.options) {
                if (description.includes(option.value.toLowerCase())) {
                    weatherTypeSelect.value = option.value;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                weatherTypeSelect.value = "Clear Sky";
            }

            apiWeatherEmoji.innerHTML = "";

            const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
            let img = apiWeatherEmoji.querySelector('img');
            if (!img) {
                img = document.createElement('img');
                img.className = "weather-img";
                apiWeatherEmoji.appendChild(img);
            }
            img.src = iconUrl;
            img.title = weather.description;
        } 
        else {
            resetValues();
        }
    } 
    catch (error) {
        console.error(error);
        resetValues();
    }

});


function resetValues(){
    apiTemperatureCelsius.value = "";
    apiTemperatureFahrenheit.value = ""
    apiWeatherEmoji.textContent = "☀️";
    weatherTypeSelect.value = "Sunny";
}