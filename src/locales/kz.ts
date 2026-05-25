import type { Translations } from "./ru"

import { kzNav }        from "./kz/nav"
import { kzHero }       from "./kz/hero"
import { kzCategories } from "./kz/categories"
import { kzPromo }      from "./kz/promo"
import { kzProduct }    from "./kz/product"
import { kzCart }       from "./kz/cart"
import { kzCheckout }   from "./kz/checkout"
import { kzCatalog }    from "./kz/catalog"
import { kzAi }         from "./kz/ai"
import { kzProfile }    from "./kz/profile"
import { kzTracking }   from "./kz/tracking"
import { kzFavorites }  from "./kz/favorites"
import { kzOrder }      from "./kz/order"
import { kzFooter }     from "./kz/footer"
import { kzCommon }     from "./kz/common"
import { kzLogin }     from "./kz/login"

export const kz: Translations = {
  ...kzNav,
  ...kzHero,
  ...kzCategories,
  ...kzPromo,
  ...kzProduct,
  ...kzCart,
  ...kzCheckout,
  ...kzCatalog,
  ...kzAi,
  ...kzProfile,
  ...kzTracking,
  ...kzFavorites,
  ...kzOrder,
  ...kzFooter,
  ...kzCommon,
  ...kzLogin,
}
