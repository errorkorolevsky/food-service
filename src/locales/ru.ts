import { ruNav }        from "./ru/nav"
import { ruHero }       from "./ru/hero"
import { ruCategories } from "./ru/categories"
import { ruPromo }      from "./ru/promo"
import { ruProduct }    from "./ru/product"
import { ruCart }       from "./ru/cart"
import { ruCheckout }   from "./ru/checkout"
import { ruCatalog }    from "./ru/catalog"
import { ruAi }         from "./ru/ai"
import { ruProfile }    from "./ru/profile"
import { ruTracking }   from "./ru/tracking"
import { ruFavorites }  from "./ru/favorites"
import { ruOrder }      from "./ru/order"
import { ruFooter }     from "./ru/footer"
import { ruCommon }     from "./ru/common"
import { ruLogin }     from "./ru/login"

export const ru = {
  ...ruNav,
  ...ruHero,
  ...ruCategories,
  ...ruPromo,
  ...ruProduct,
  ...ruCart,
  ...ruCheckout,
  ...ruCatalog,
  ...ruAi,
  ...ruProfile,
  ...ruTracking,
  ...ruFavorites,
  ...ruOrder,
  ...ruFooter,
  ...ruCommon,
  ...ruLogin,
}

export type Translations = typeof ru
