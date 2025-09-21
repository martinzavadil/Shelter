# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e4]:
      - link "Sheltr" [ref=e6] [cursor=pointer]:
        - /url: /
      - generic [ref=e8]:
        - link "Map" [ref=e9] [cursor=pointer]:
          - /url: /map
        - link "Discover" [ref=e10] [cursor=pointer]:
          - /url: /discover
        - link "Trip Builder" [ref=e11] [cursor=pointer]:
          - /url: /trip-builder
        - link "Emergency" [ref=e12] [cursor=pointer]:
          - /url: /emergency
      - generic [ref=e14]: Loading...
  - main [ref=e15]:
    - generic [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]: Sign In
        - generic [ref=e20]: Enter your credentials to access your account
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]:
            - generic [ref=e24]: Email
            - textbox "Email" [ref=e25]
          - generic [ref=e26]:
            - generic [ref=e27]: Password
            - textbox "Password" [ref=e28]
          - button "Sign In" [ref=e29]
        - generic [ref=e30]:
          - text: Don't have an account?
          - link "Sign up" [ref=e31] [cursor=pointer]:
            - /url: /register
  - region "Notifications alt+T"
  - alert [ref=e32]
```