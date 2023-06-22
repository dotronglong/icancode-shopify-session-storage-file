# icancode-shopify-session-storage-file

## How to use

```javascript
import {FileSessionStorage} from '@icancode/shopify-session-storage-file';

// use default configuration
let sessionStorage = new FileSessionStorage();

// specify location to store session's data
// let sessionStorage = new FileSessionStorage({location: '.sessions'});

const shopify = shopifyApp({
  sessionStorage,
  // ...
});
```