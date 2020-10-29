import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element; // HTMLElement
  subElements = {};
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0
  };

  constructor (productId) {
    this.productId = productId;
    this.fields = Object.keys(this.defaultFormData);
    this.defaultFormData.images = [];
  }

  async render () {
    const categoriesPromise = this.loadCategoriesList();

    const productPromise = this.productId
      ? this.loadProductData(this.productId)
      : [this.defaultFormData];

    const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise]);
    const [productData] = productResponse;

    this.formData = productData;
    this.categories = categoriesData;

    this.renderForm();
    this.setFormData();
    this.initEventListeners();

    return this.element;
  }

  initEventListeners () {
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
    this.subElements.uploadImage.addEventListener('click', this.uploadImage);
  }

  onSubmit = event => {
    event.preventDefault();
    this.save();
  };

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      console.error('error', error);
    }
  }

  getFormData () {
    const values = {};

    for (const field of this.fields) {
      values[field] = this.subElements.productForm.querySelector(`#${field}`).value;
    }

    const imagesHTMLCollection = this.subElements.imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
  }

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  setFormData () {
    this.fields.forEach(item => {
      const element = this.subElements.productForm.querySelector(`#${item}`);
      if (element) {
        element.value = this.formData[item] || this.defaultFormData[item];
      }
    });
  }

  renderForm () {
    const div = document.createElement('div');
    div.ClassName = "product-form";
    div.innerHTML = this.template();

    this.element = div;
    this.subElements = {
        productForm: div.querySelector('[data-element="productForm"]'),
        imageListContainer: div.querySelector('[data-element="imageListContainer"]'),
        uploadImage: div.querySelector('[name="uploadImage"]'),
        };
    this.createImagesList();
  }

  async loadProductData (productId) {
    return await fetchJson(`${BACKEND_URL}/api/rest/products?id=${productId}`);
  }

  async loadCategoriesList () {
    return await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  template () {
    return `<form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"></div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" id="subcategory" name="subcategory">${this.createCategoriesList()}</select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" id="price" name="price" class="form-control" placeholder="${this.defaultFormData.price}">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" id="discount" name="discount" class="form-control" placeholder="${this.defaultFormData.discount}">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="${this.defaultFormData.quantity}">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" id="status" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>`;
  }

  createCategoriesList () {
    const list = [];

    for (const category of this.categories) {
      for (const child of category.subcategories) {
        list.push(`<option value="${child.id}">${category.title} > ${child.title}</option>`);
      }
    }

    return list.join('');
  }

  createImagesList () {
    const sortableList = new SortableList({
      items: this.formData.images.map(item => {
        return this.getImageElement(item.url, item.source);
      })
    });

    this.subElements.imageListContainer.append(sortableList.element);
  }

  getImageElement (url, name) {
        const element = document.createElement('li');
        element.className = "products-edit__imagelist-item sortable-list__item";       
        element.innerHTML = this.getImageItem(url, name);
        return element;
  }

  getImageItem (url, name) {
    return `
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>

        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>`;
  }

  uploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData,
        });

        imageListContainer.firstElementChild.append(this.getImageElement(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        // Remove input from body
        fileInput.remove();
      }
    };

    // must be in body for IE
    fileInput.hidden = true;
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('submit', this.onSubmit);
    document.removeEventListener('click', this.uploadImage);
  }

}
