import {GridSwatch} from '../features/swatch';
import {HoverImages} from '../features/hover-images';
import {QuickAddProduct} from '../features/quick-add-product';

if (!customElements.get('quick-add-product')) {
  customElements.define('quick-add-product', QuickAddProduct);
}

if (!customElements.get('grid-swatch')) {
  customElements.define('grid-swatch', GridSwatch);
}

if (!customElements.get('hover-images')) {
  customElements.define('hover-images', HoverImages);
}