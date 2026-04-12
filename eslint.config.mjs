import nextConfig from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts"
    ]
  },
  {
    rules: {
      "semi": ["error", "never"]
    }
  }
]

export default eslintConfig
