class RadioButtonCustom {
    constructor(containerId, values, defaultSelected) {
        this.container = document.getElementById(containerId);
        this.values = values;
        this.defaultSelected = defaultSelected;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <fieldset>
                <div class="toggle">
                    ${this.values.map((value, index) => `
                        <input type="radio" name="customradio_${this.container.id}" value="${value}" id="radiovalue${value}_${this.container.id}" ${this.defaultSelected === index + 1 ? 'checked="checked"' : ''}/>
                        <label for="radiovalue${value}_${this.container.id}">${value}</label>
                    `).join('')}
                    <input type="radio" name="customradio_${this.container.id}" value="custom" id="radiovalueCustom_${this.container.id}" ${this.defaultSelected === 4 ? 'checked="checked"' : ''}/>
                    <label for="radiovalueCustom_${this.container.id}">Custom</label>
                </div>
                <div class="custom-input" id="customInput_${this.container.id}">
                    <input type="text" placeholder="Enter custom value"/>
                </div>
            </fieldset>
        `;

        this.addListeners();
        this.toggleCustomInput();
    }

    addListeners() {
        const radios = this.container.querySelectorAll(`input[name="customradio_${this.container.id}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', this.toggleCustomInput.bind(this));
        });
    }

    toggleCustomInput() {
        const customInput = this.container.querySelector(`.custom-input`);
        if (this.container.querySelector(`#radiovalueCustom_${this.container.id}`).checked) {
            customInput.style.display = 'block';
        } else {
            customInput.style.display = 'none';
        }
    }

    getValue() {
        // Check if the custom option is selected
        const isCustomSelected = this.container.querySelector(`#radiovalueCustom_${this.container.id}`).checked;
        if (isCustomSelected) {
            // Return the value from the custom input field
            const customValue = this.container.querySelector(`#customInput_${this.container.id} input`).value.trim();
            return customValue ? customValue : null; // Return null if the custom input is empty
        } else {
            // Return the value of the selected radio button
            const selectedRadio = this.container.querySelector(`input[name="customradio_${this.container.id}"]:checked`);
            return selectedRadio ? selectedRadio.value : null;
        }
    }
}
