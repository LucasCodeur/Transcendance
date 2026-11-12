# sv

## this svelte project was created using the following command :

```sh
npx sv@1.1.1 create --template minimal --types ts --add tailwindcss="plugins:typography,forms" --install npm ./
npx prisma orm init
```

## install dependencies:

```
make install
```

## Developping

start a development server:

```sh
make dev
```

stop development server:

```sh
make down
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
