const template = document.createElement('template');
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<label class="label mb-3">Color </label>
<div class="select mb-3">
    <select>
        <option value="rgb(255, 0, 0)">Red</option>
        <option value="rgb(0, 255, 0)">Green</option>
        <option value="rgb(0, 0, 255)">Blue</option>
        <option value="rgb(255, 255, 0)">Yellow</option>
        <option value="rgb(255, 0, 255)">Magenta</option>
        <option value="rgb(0, 255, 255)">Cyan</option>
        <option value="rgb(255, 165, 0)">Orange</option>
        <option value="rgb(255, 105, 180)">Pink</option>
        <option value="rgb(75, 0, 130)">Indigo</option>
        <option value="rgb(139, 69, 19)">Brown</option>
        <option value="rgb(156, 175, 136)">Sage</option>
    </select>
</div>
`;

// A select element that allows the user to choose between a selection of colors
class ColorSelect extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.label = this.shadowRoot.querySelector('label');
    this.select = this.shadowRoot.querySelector('select');
  }

  connectedCallback() {
    const columnChildren = Array.from(this.parentElement.children);
    const rootChildren = Array.from(this.parentElement.parentElement.children);
    const index = columnChildren.indexOf(this) + 6 * rootChildren.indexOf(this.parentElement);

    this.label.textContent += `${index + 1}:`;
    this.select.children[index].selected = true;
  }
}

customElements.define('color-select', ColorSelect);
