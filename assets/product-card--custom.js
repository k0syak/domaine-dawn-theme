const BLANK_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

class ProductCardCustom extends HTMLElement {
  #initialized = false;

  connectedCallback() {
    if (this.#initialized) return;

    this.cacheDom();
    this.cacheData();

    this.addEventListener('change', this.onChange);
    this.addEventListener('click', this.onAddToCartClick);

    this.#initialized = true;
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.onChange);
    this.removeEventListener('click', this.onAddToCartClick);
    this.#initialized = false;
  }

  cacheDom() {
    this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
    this.imgPrimary = this.querySelector('[data-product-card="image-primary"]');
    this.imgSecondary = this.querySelector('[data-product-card="image-secondary"]');
    this.badgeSale = this.querySelector('[data-product-card="badge-sale"]');
    this.priceRegular = this.querySelector('[data-product-card="price-regular"]');
    this.priceCompareAt = this.querySelector('[data-product-card="price-compare"]');
    this.productLinks = Array.from(this.querySelectorAll('[data-product-card="product-link"]'));
    this.addToCartBtn = this.querySelector('[data-product-card="add-to-cart"]');
    this.productUrl = this.dataset.productUrl || '';
  }

  cacheData() {
    const script = this.querySelector('[data-product-card-variants="json"]');
    if (!script) {
      this.variants = [];
      return;
    }

    try {
      this.variants = JSON.parse(script.textContent.trim()) || [];
    } catch {
      this.variants = [];
    }
  }

  onChange = (event) => {
    const input = event.target;
    if (!input.matches('[data-product-card="variant-swatch"]') || !this.contains(input)) return;

    const variant = this.getVariant(input.value);
    if (!variant) return;

    this.renderVariant(variant);
  };

  onAddToCartClick = (event) => {
    const button = event.target.closest('[data-product-card="add-to-cart"]');
    if (!button || !this.contains(button)) return;

    event.preventDefault();

    const variantId = button.dataset.selectedVariantId;
    if (!variantId) return;

    this.addToCart(button, variantId);
  };

  getVariant(variantId) {
    if (!variantId) return null;
    return this.variants.find((variant) => String(variant.variantId) === String(variantId)) || null;
  }

  renderVariant(variant) {
    if (!variant) return;

    this.renderBadge(variant);
    this.renderPrice(variant);
    this.renderImages(variant);
    this.updateProductLinks(variant.variantId);
    this.updateAddToCart(variant.variantId);
  }

  renderBadge(variant) {
    if (!this.badgeSale) return;
    this.badgeSale.classList.toggle('tw:hidden', !variant.isOnSale);
  }

  renderPrice(variant) {
    if (this.priceRegular) {
      this.priceRegular.textContent = variant.price?.regular || '';
      this.priceRegular.classList.toggle('tw:text-card-sale', !!variant.isOnSale);
      this.priceRegular.classList.toggle('tw:text-card-body', !variant.isOnSale);
    }

    if (!this.priceCompareAt) return;

    if (!variant.isOnSale || !variant.price?.compareAt) {
      this.priceCompareAt.classList.add('tw:hidden');
      this.priceCompareAt.textContent = '';
      return;
    }

    this.priceCompareAt.textContent = variant.price.compareAt;
    this.priceCompareAt.classList.remove('tw:hidden');
  }

  renderImages(variant) {
    const primary = variant.images?.primary;
    const secondary = variant.images?.secondary;

    if (this.imgPrimary && primary && this.imgPrimary.src !== primary) {
      this.imgPrimary.src = primary;
    }

    if (!this.imgSecondary) return;

    if (!secondary) {
      this.imgSecondary.src = BLANK_IMAGE;
      this.imgPrimary?.classList.remove('tw:group-hover:opacity-0');

      return;
    }

    this.imgSecondary.src = secondary;
    this.imgPrimary?.classList.add('tw:group-hover:opacity-0');
  }

  updateProductLinks(variantId) {
    if (!this.productLinks.length || !this.productUrl) return;

    const url = new URL(this.productUrl, window.location.origin);
    url.searchParams.set('variant', String(variantId));
    const href = `${url.pathname}${url.search}`;

    for (const link of this.productLinks) {
      link.href = href;
    }
  }

  updateAddToCart(variantId) {
    if (!this.addToCartBtn) return;
    this.addToCartBtn.dataset.selectedVariantId = String(variantId);
  }

  async addToCart(button, variantId) {
    if (button.getAttribute('aria-disabled') === 'true') return;

    button.setAttribute('aria-disabled', 'true');

    const formData = new FormData();
    formData.append('id', variantId);
    formData.append('quantity', 1);
    formData.append('sections_url', window.location.pathname);

    if (this.cart) {
      formData.append(
        'sections',
        this.cart.getSectionsToRender().map((section) => section.id)
      );
      this.cart.setActiveElement(button);
    }

    // Reuse base Dawn flow fetchConfig
    const config = window.fetchConfig('javascript');
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    delete config.headers['Content-Type'];
    config.body = formData;

    try {
      const response = await fetch(`${ window.routes.cart_add_url}`, config);
      const result = await response.json();

      if (result.status) {
        publish(PUB_SUB_EVENTS.cartError, {
          source: 'product-card-custom',
          productVariantId: variantId,
          errors: result.errors || result.description,
          message: result.message,
        });
        console.error(result.description);
        return;
      }

      if (!this.cart) {
        window.location = window.routes.cart_url;
        return;
      }

      publish(PUB_SUB_EVENTS.cartUpdate, {
        source: 'product-card-custom',
        productVariantId: variantId,
        cartData: result,
      });

      this.cart.renderContents(result);

      if (this.cart.classList.contains('is-empty')) {
        this.cart.classList.remove('is-empty');
      }
    } catch (error) {
      console.error(error);
    } finally {
      button.removeAttribute('aria-disabled');
    }
  }
}

if (!customElements.get('product-card-custom')) {
  customElements.define('product-card-custom', ProductCardCustom);
}
