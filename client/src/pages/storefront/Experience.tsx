import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Experience() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#fdf3d8] to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-primary-600 mb-4">
            {t('experience.kicker')}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight font-[family-name:var(--font-heading)]">
            {t('experience.title')}
          </h1>
          <p className="mt-5 text-lg text-gray-600 leading-relaxed">
            {t('experience.subtitle')}
          </p>
        </div>
      </section>

      {/* Press release body */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <article className="space-y-6 text-gray-700 leading-relaxed text-[1.05rem]">
          <p>
            <span className="font-semibold text-gray-900">Liberia, Costa Rica</span> — Ado Palm
            Winery has officially appointed Mr. Francis N. Onochie (known as "Frank Jr." or
            "Tropical Frank") as Managing Director. The appointment marks the third generation of
            family leadership for the pioneer in bottled palm sap beverages as the company scales
            operations to bring traditional Vino de Coyol to international hospitality markets.
          </p>
          <p>
            Founded in 1979 by Chief Professor Benedict Onochie—honored in his native Onitsha,
            Nigeria, as the Ononenyi of Onitsha ("The Man who sits on the High Chair")—Ado Palm
            Winery solved the complex challenge of capturing and stabilizing the rich, sweet, and
            earthy flavor of naturally fermented palm sap in a bottle. Prior to his research, rapid
            fermentation meant palm wine could only be consumed where it was tapped or produced.
          </p>
          <p>
            The foundation was expanded under second-generation leader and second son Dr. Francis
            "Dr. Frank" Onochie, who set out to make the beverage a household name worldwide. In
            2019, responding to rising demand across North and South America, Dr. Frank
            strategically relocated Ado Palm Winery's global headquarters to Costa Rica.
          </p>

          <blockquote className="border-l-4 border-primary-500 bg-primary-50/50 rounded-r-xl px-6 py-5 my-8">
            <p className="text-gray-800 italic">
              "Growing up, palm wine held a key spiritual and ceremonial role in our community. It
              is not just a drink; it is an experience. Relocating to Costa Rica placed us in the
              heart of Central America, allowing us to serve our growing clientele across the
              Americas."
            </p>
            <footer className="mt-3 text-sm font-semibold text-primary-700">
              — Dr. Frank Onochie
            </footer>
          </blockquote>

          <p>
            Stepping into the executive role after years of working in global sales management and
            operations alongside his father, Frank Jr. brings a dynamic passion for agriculture,
            tropical culture, and international lifestyle brands. Under his leadership, Ado Palm
            Winery is positioning its portfolio for wide distribution across iconic coastal
            destinations, beach bars, and luxury resorts globally.
          </p>

          <blockquote className="border-l-4 border-primary-500 bg-primary-50/50 rounded-r-xl px-6 py-5 my-8">
            <p className="text-gray-800 italic">
              "We are working hard to maintain strong relationships with our clients to meet
              fast-growing demand. My ambition is to own every sunset at beach venues across the
              globe—from Ibiza and Phuket to Ipanema Beach in Brazil. Vino de Coyol is a natural,
              probiotic beverage and a national heritage of Costa Rica. I intend to ensure my
              grandfather's original vision comes to total fruition."
            </p>
            <footer className="mt-3 text-sm font-semibold text-primary-700">
              — Francis N. Onochie, Managing Director
            </footer>
          </blockquote>
        </article>

        {/* Product lineup */}
        <div className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            Expanded Craft Product Lineup
          </h2>
          <p className="mt-3 text-gray-700 leading-relaxed">
            Alongside its flagship Vino de Coyol Original, Ado Palm Winery produces a broad
            portfolio of natural beverages:
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900">Fruit-Infused Vino de Coyol</h3>
              <p className="text-sm text-gray-600 mt-1">
                Flavored craft expressions featuring pure Passion Fruit and Pineapple.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900">El Fuego de Coyol</h3>
              <p className="text-sm text-gray-600 mt-1">
                A smooth, high-proof Palm Gin crafted from distilled Vino de Coyol.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 sm:col-span-2">
              <h3 className="font-semibold text-gray-900">'The Sunset' Cocktail</h3>
              <p className="text-sm text-gray-600 mt-1">
                The brand's signature mixed drink, combining a balanced ratio of flavoured Vino de
                Coyol and "El Fuego de Coyol" Palm Gin into a single, ready-to-serve beachside
                cocktail.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors"
            >
              {t('experience.shopCta')}
            </Link>
          </div>
        </div>

        {/* About */}
        <div className="mt-16 bg-[#fdf3d8] rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            About Ado Palm Winery
          </h2>
          <p className="mt-3 text-gray-700 leading-relaxed">
            Established in 1979, Ado Palm Winery is an international producer of premium fermented
            and distilled palm sap beverages. Headquartered in Liberia, in the Pacific Coast of
            Costa Rica, the family-owned enterprise bridges cultural heritage with modern bottling
            innovation to supply all-natural, probiotic palm wines and spirits to consumers
            worldwide.
          </p>
        </div>
      </section>
    </div>
  );
}
