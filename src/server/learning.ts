/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LearningCourse {
  id: string;
  topic: string;
  topicTa: string;
  icon: string;
  description: string;
  descriptionTa: string;
  beginner: {
    title: string;
    titleTa: string;
    content: string;
    contentTa: string;
  };
  intermediate: {
    title: string;
    titleTa: string;
    content: string;
    contentTa: string;
  };
  advanced: {
    title: string;
    titleTa: string;
    content: string;
    contentTa: string;
  };
}

export const learningCourses: LearningCourse[] = [
  {
    id: 'budgeting',
    topic: 'Budgeting & Cashflow',
    topicTa: 'பட்ஜெட் மற்றும் பணப்புழக்கம்',
    icon: 'TrendingUp',
    description: 'Master the art of tracking cash flow, optimizing savings, and designing your wealth buffer.',
    descriptionTa: 'பணப்புழக்கத்தைக் கண்காணித்தல், சேமிப்பை அதிகரித்தல் மற்றும் உங்கள் செல்வத்தை உருவாக்குதல் ஆகியவற்றைக் கற்றுக்கொள்ளுங்கள்.',
    beginner: {
      title: 'Budgeting: Think of it like a Video Game!',
      titleTa: 'பட்ஜெட்: ஒரு வீடியோ கேம் போன்றது!',
      content: 'Imagine your monthly income is your character\'s Health Points (HP). If you spend more HP than you collect, your game is over! A budget is just a blueprint of how you spend your HP. The easiest trick is the 50/30/20 Rule: 50% for your survival needs (rent, electricity, food), 30% for your fun desires (games, movies), and 20% goes straight to your gold chest (savings) before you even start spending!',
      contentTa: 'உங்கள் மாதாந்திர வருமானத்தை உங்கள் வீடியோ கேம் கேரக்டரின் ஹெல்த் பாயிண்ட்ஸ் (HP) என்று கற்பனை செய்து கொள்ளுங்கள். நீங்கள் சேகரிப்பதை விட அதிக HP-ஐ செலவழித்தால், கேம் ஓவர் ஆகிவிடும்! பட்ஜெட் என்பது உங்கள் HP-ஐ எவ்வாறு செலவிடுகிறீர்கள் என்பதற்கான வரைபடம் மட்டுமே. எளிதான வழி 50/30/20 விதி: 50% உயிர்வாழும் தேவைகளுக்காக (வாடகை, மின்சாரம், உணவு), 30% பொழுதுபோக்கிற்காக (விளையாட்டுகள், திரைப்படங்கள்), மற்றும் 20% உங்கள் தங்கப் பெட்டிக்கு (சேமிப்பு) நேரடியாகச் செல்கிறது!'
    },
    intermediate: {
      title: 'Applying the 50/30/20 Rule in Real Life',
      titleTa: 'நிஜ வாழ்க்கையில் 50/30/20 விதியைப் பயன்படுத்துதல்',
      content: 'Let\'s take a real example. If you make $3,000 net income per month:\n- **$1,500 (50%)** goes to Needs (Groceries, Utilities, Rent).\n- **$900 (30%)** goes to Wants (Dining out, streaming plans, travel).\n- **$600 (20%)** goes to Savings & Investing.\n\nBy automating this on Day 1 (putting $600 directly into an index fund or savings account), you achieve "Pay Yourself First." You will never have to worry about running out of savings at the end of the month because the savings were already secure!',
      contentTa: 'உதாரணமாக, உங்களுக்கு மாதம் $3,000 வருமானம் கிடைத்தால்:\n- **$1,500 (50%)** தேவைகளுக்காக (மளிகை, வாடகை, மின்சாரம்).\n- **$900 (30%)** விருப்பங்களுக்காக (ஹோட்டல் உணவு, சினிமா, பயணம்).\n- **$600 (20%)** சேமிப்பு மற்றும் முதலீட்டிற்காக.\n\nமாதத்தின் முதல் நாளிலேயே $600-ஐ சேமிப்புக் கணக்குக்கு மாற்றுவதன் மூலம் "உங்களுக்கு முதலில் பணம் செலுத்துங்கள்" என்ற கொள்கையை அடையலாம். மாத இறுதியில் பணம் இல்லை என்று கவலைப்படத் தேவையில்லை!'
    },
    advanced: {
      title: 'Cashflow Optimization & Asset Allocation Velocity',
      titleTa: 'பணப்புழக்க மேம்படுத்தல் மற்றும் சொத்து ஒதுக்கீட்டு வேகம்',
      content: 'At a professional level, budgeting transitions into optimization of asset allocation velocity. Every dollar of income should be evaluated on its Opportunity Cost. High-earning individuals use Zero-Based Budgeting, allocating 100% of cashflow to either essential expenses or specific equity/bond/cash instruments on day one. Increasing your savings rate from 20% to 50% accelerates your Financial Independence, Retire Early (FIRE) milestone, shrinking your working career timeframe by over 15 years through compound interest multipliers.',
      contentTa: 'மேம்பட்ட மட்டத்தில், பட்ஜெட் என்பது உங்கள் சொத்துக்களை எவ்வாறு திறமையாக ஒதுக்குகிறீர்கள் என்பதைப் பொறுத்தது. உங்கள் வருமானத்தின் ஒவ்வொரு பைசாவும் அதன் வாய்ப்பு செலவு (Opportunity Cost) அடிப்படையில் மதிப்பிடப்பட வேண்டும். அதிக வருமானம் ஈட்டுபவர்கள் ஜீரோ-பேஸ்டு பட்ஜெட்டைப் (Zero-Based Budgeting) பயன்படுத்தி, முதல் நாளிலேயே பணப்புழக்கத்தை சேமிப்பு அல்லது பங்குகளில் ஒதுக்குகிறார்கள். சேமிப்பு விகிதத்தை 20%-லிருந்து 50%-ஆக அதிகரிப்பது உங்கள் நிதி சுதந்திரத்தை (FIRE) விரைவுபடுத்துகிறது.'
    }
  },
  {
    id: 'emergency-fund',
    topic: 'Emergency Funds',
    topicTa: 'அவசரகால நிதிகள்',
    icon: 'Shield',
    description: 'Construct a bulletproof shield to defend your lifestyle against unexpected events.',
    descriptionTa: 'எதிர்பாராத நிகழ்வுகளிலிருந்து உங்கள் வாழ்க்கையைப் பாதுகாக்க ஒரு வலுவான கேடயத்தை உருவாக்குங்கள்.',
    beginner: {
      title: 'Emergency Fund: Your Financial Umbrella',
      titleTa: 'அவசரகால நிதி: உங்கள் நிதி குடை',
      content: 'If it starts pouring rain suddenly, you\'ll get soaked unless you have an umbrella. An emergency fund is exactly that—an umbrella for your money! It is a special cash savings vault you NEVER touch for fun things. If your laptop breaks or you suddenly lose your job, you don\'t have to borrow money; you just open your financial umbrella and stay completely dry!',
      contentTa: 'திடீரென்று மழை பெய்தால், குடை இல்லாவிட்டால் நனைந்துவிடுவீர்கள். அவசரகால நிதி என்பது உங்கள் பணத்திற்கான குடை! இது ஒரு சிறப்புச் சேமிப்புப் பெட்டியாகும், இதை விளையாட்டுத்தனமாக செலவிடக்கூடாது. உங்கள் மடிக்கணினி உடைந்தாலோ அல்லது வேலை இழந்தாலோ, யாரிடமும் கடன் வாங்கத் தேவையில்லை; உங்கள் நிதி குடையைத் திறந்து உங்களைப் பாதுகாத்துக் கொள்ளலாம்!'
    },
    intermediate: {
      title: 'Calculating Your Safety Cushion Size',
      titleTa: 'பாதுகாப்பு நிதியைக் கணக்கிடுதல்',
      content: 'How big should your umbrella be? Calculate your **Absolute Essential Expenses** per month (Rent + Utilities + Basic Groceries). A healthy cushion is **3 to 6 months** of these essential expenses.\n\nFor example, if your essentials cost $1,500/mo, aim to build an emergency fund of $4,500 to $9,000. Keep this money in a High-Yield Savings Account (HYSA) so it grows slightly, but remains instantly accessible within minutes during an crisis.',
      contentTa: 'உங்கள் குடை எவ்வளவு பெரியதாக இருக்க வேண்டும்? உங்கள் மாதாந்திர **அத்தியாவசிய செலவுகளைக்** கணக்கிடுங்கள் (வாடகை + மின்சாரம் + உணவு). ஒரு சிறந்த அவசரகால நிதி என்பது **3 முதல் 6 மாதங்கள்** வரையிலான அத்தியாவசிய செலவுத் தொகையாகும்.\n\nஉதாரணமாக, உங்கள் அத்தியாவசிய செலவு மாதம் $1,500 எனில், உங்கள் அவசரகால நிதி $4,500 முதல் $9,000 வரை இருக்க வேண்டும். இந்த பணத்தை உடனடியாக எடுக்கக்கூடிய அவசர சேமிப்புக் கணக்கில் வைத்திருக்க வேண்டும்.'
    },
    advanced: {
      title: 'Liquidity Arbitrage & Tiered Reserve Architecture',
      titleTa: 'மூலதன நீர்மை மற்றும் அடுக்கு இருப்பு கட்டமைப்பு',
      content: 'Advanced treasury management structures emergency reserves into tiers to balance liquidity with yield optimization. \n- **Tier 1 (Instant Liquidity)**: 1 month of expenses in high-yield checking accounts for immediate card/ATM transactions.\n- **Tier 2 (Settle in T+1)**: 2-3 months of expenses in highly liquid Short-Term Treasury Bills or Money Market Funds to earn premium yield risk-free.\n- **Tier 3 (Credit Buffer)**: Leveraging zero-interest credit card billing cycles as short-term debt proxies, backed by liquid assets.',
      contentTa: 'மேம்பட்ட கருவூல மேலாண்மை அவசரகால இருப்புகளை அடுக்குகளாகப் பிரிக்கிறது:\n- **அடுக்கு 1 (உடனடி நீர்மை)**: 1 மாத செலவுத் தொகை உடனடியாக எடுக்கக்கூடிய சேமிப்புக் கணக்கில்.\n- **அடுக்கு 2 (T+1 தீர்வு)**: 2-3 மாத செலவுத் தொகை அரசு பத்திரங்கள் அல்லது பணச் சந்தை நிதிகளில் அதிக வட்டி பெற.\n- **அடுக்கு 3 (கடன் வரம்பு)**: வட்டி இல்லாத கடன் அட்டை வரம்புகளை அவசர தேவைக்குத் தற்காலிகமாகப் பயன்படுத்துதல்.'
    }
  },
  {
    id: 'sip',
    topic: 'Systematic Investment Plan (SIP)',
    topicTa: 'முறைப்படுத்தப்பட்ட முதலீட்டுத் திட்டம் (SIP)',
    icon: 'RefreshCw',
    description: 'Harness the power of compounding and dollar-cost averaging automatically.',
    descriptionTa: 'கூட்டு வட்டி மற்றும் சராசரிச் செலவின் ஆற்றலைத் தானாகவே பயன்படுத்திக் கொள்ளுங்கள்.',
    beginner: {
      title: 'SIP: Growing a Magic Money Tree!',
      titleTa: 'SIP: ஒரு மாய பண மரத்தை வளர்த்தல்!',
      content: 'Instead of trying to buy a massive tree on day one, you plant a single tiny seed and water it with a small cup of water every single month. Over time, that tiny seed grows into a huge, magnificent tree that drops coins for you! An SIP is just that: investing a small, fixed amount (like $50) into mutual funds every month. It teaches you discipline, and compound interest does the heavy lifting while you sleep!',
      contentTa: 'ஒரே நாளில் ஒரு பெரிய மரத்தை வாங்க முயற்சிப்பதற்குப் பதிலாக, நீங்கள் ஒரு சிறிய விதையை நட்டு, ஒவ்வொரு மாதமும் ஒரு சிறிய கப் தண்ணீர் ஊற்றுகிறீர்கள். காலப்போக்கில், அந்த விதை ஒரு பெரிய மரமாக வளர்ந்து உங்களுக்குப் பணத்தை வழங்கும்! எஸ்ஐபி (SIP) என்பது போன்றது: ஒவ்வொரு மாதமும் ஒரு சிறிய தொகையை (எ.கா. $50) பரஸ்பர நிதிகளில் முதலீடு செய்வது. இது உங்களுக்கு ஒழுக்கத்தைக் கற்பிக்கிறது!'
    },
    intermediate: {
      title: 'The Miracle of Dollar-Cost Averaging',
      titleTa: 'டாலர்-செலவு சராசரியின் அற்புதம்',
      content: 'SIP works through **Dollar-Cost Averaging**. When the stock market is crashing and prices are low, your monthly $100 buys MORE units of the fund. When the market is booming and prices are high, your $100 buys FEWER units. \n\nThis means you automatically buy low and sell high without stress or trying to predict stock market trends! It completely removes emotional bias and builds massive wealth over 10-15 year cycles.',
      contentTa: 'எஸ்ஐபி (SIP) என்பது **சராசரி முதலீட்டுச் செலவு** மூலம் செயல்படுகிறது. பங்குச் சந்தை வீழ்ச்சியடைந்து விலைகள் குறைவாக இருக்கும்போது, உங்கள் மாதாந்திர $100 முதலீடு அதிக யூனிட்களை வாங்கும். சந்தை உயரும்போது குறைந்த யூனிட்களை வாங்கும்.\n\nஇதன் பொருள் நீங்கள் சந்தையை கணிக்க வேண்டிய அவசியமில்லை, தானாகவே குறைந்த விலையில் வாங்கி அதிக விலையில் விற்பதற்கு சமமாகிறது!'
    },
    advanced: {
      title: 'Compound Mathematical Modeling & Volatility Harvesting',
      titleTa: 'கூட்டு கணித மாடலிங் மற்றும் சந்தை ஏற்ற இறக்கப் பயன்பாடு',
      content: 'SIP mathematics leverages compounding formulas: $A = P \\times \\frac{(1 + i)^n - 1}{i} \\times (1 + i)$. The primary benefit is Volatility Harvesting. High-volatility equity mutual funds are superior for long-term SIP allocations compared to low-volatility funds because the cost basis is optimized downwards during severe market contractions. This systematic purchasing lowers the weighted cost of capital, magnifying net equity return multiples when markets re-establish their long-term upward trajectory.',
      contentTa: 'எஸ்ஐபி கணிதம் கூட்டு வட்டி சூத்திரத்தைப் பயன்படுத்துகிறது. இதன் முக்கிய நன்மை சந்தை ஏற்ற இறக்கங்களை நமக்குச் சாதகமாகப் பயன்படுத்துவதாகும். சந்தை வீழ்ச்சியடையும் போது சராசரி கொள்முதல் விலை குறைவதால், நீண்ட காலத்தில் சந்தை மீண்டும் உயரும் போது உங்கள் நிகர லாபம் பல மடங்கு அதிகரிக்கிறது.'
    }
  },
  {
    id: 'etf',
    topic: 'Exchange-Traded Funds (ETF)',
    topicTa: 'பங்குச் சந்தை வர்த்தக நிதி (ETF)',
    icon: 'Layers',
    description: 'Own a basket of the world\'s top companies with a single transaction.',
    descriptionTa: 'ஒரே பரிவர்த்தனை மூலம் உலகின் சிறந்த நிறுவனங்களின் பங்குகளை ஒரு கூடையில் சொந்தமாக்குங்கள்.',
    beginner: {
      title: 'ETF: A Fruit Basket of Stocks!',
      titleTa: 'ETF: பங்குகளின் பழக் கூடை!',
      content: 'Imagine you want to eat apples, bananas, grapes, and oranges, but you only have $10. You can\'t afford to buy full boxes of all of them! An ETF is like buying a pre-made "fruit basket" slice. It is one single share you buy, but inside it contains tiny slices of hundreds of top companies (like Apple, Microsoft, Amazon). If one company falls, the other hundreds keep your basket safe!',
      contentTa: 'நீங்கள் ஆப்பிள், வாழைப்பழம், திராட்சை மற்றும் ஆரஞ்சு பழங்களை சாப்பிட விரும்புகிறீர்கள், ஆனால் உங்களிடம் $10 மட்டுமே உள்ளது. நீங்கள் அனைத்தையும் தனித்தனியாக வாங்க முடியாது! ETF என்பது ஒரு பழக்கூடை போன்றது. நீங்கள் வாங்கும் ஒரு பங்கிற்குள் நூற்றுக்கணக்கான சிறந்த நிறுவனங்களின் (ஆப்பிள், மைக்ரோசாஃப்ட் போன்றவை) சிறிய பங்குகள் இருக்கும்!'
    },
    intermediate: {
      title: 'Diversification & Extremely Low Expense Fees',
      titleTa: 'முதலீட்டுப் பரவலாக்கல் மற்றும் மிகக் குறைந்த கட்டணங்கள்',
      content: 'Instead of buying single stocks (which can crash to zero), index ETFs like those tracking the **S&P 500** purchase the 500 largest profitable companies in America. Historically, the S&P 500 return average is around **10% annually** over the long run.\n\nBest of all, ETFs have tiny costs (expense ratios under 0.05% annually), meaning almost 100% of your money\'s growth goes straight to your pocket, not to rich financial brokers.',
      contentTa: 'தனிப்பட்ட பங்குகளை வாங்குவதற்குப் பதிலாக (அவை பூஜ்ஜியமாக வீழ்ச்சியடையக்கூடும்), **S&P 500** போன்ற குறியீட்டு பங்குகளின் தொகுப்பு (ETF-கள்) சிறந்த நிறுவனங்களின் பங்குகளை வாங்குகின்றன. வரலாற்று ரீதியாக, இது நீண்ட காலத்தில் **ஆண்டுக்கு 10%** வருமானம் தந்துள்ளது.\n\nமிக முக்கியமாக, இவற்றின் மேலாண்மைக் கட்டணம் மிகக் குறைவு, இதனால் உங்களின் முழு லாபமும் உங்களுக்கே கிடைக்கிறது.'
    },
    advanced: {
      title: 'Passive Indexing Arbitrage & Capital Structure Efficiency',
      titleTa: 'செயலற்ற குறியீட்டு நடுவர் மற்றும் மூலதன கட்டமைப்பு திறன்',
      content: 'Exchange-Traded Funds utilize an "authorized participant" (AP) creation/redemption mechanism to trade close to their Net Asset Value (NAV). Passive index ETFs are significantly more tax-efficient than active mutual funds because they minimize capital gain distributions through in-kind delivery of underlying shares. Allocating capital to low-cost broad-market index ETFs captures the equity risk premium with minimal tracking error, providing mathematically optimized risk-adjusted returns (Sharpe ratio) over long horizons.',
      contentTa: 'பங்குச் சந்தை வர்த்தக நிதிகள் (ETF-கள்) அவற்றின் நிகர சொத்து மதிப்புக்கு (NAV) நெருக்கமாக வர்த்தகம் செய்ய சிறப்பு வழிமுறையைப் பயன்படுத்துகின்றன. இவை சாதாரண மியூச்சுவல் ஃபண்டுகளை விட வரித் திறன் கொண்டவை. குறைந்த கட்டண பரந்த-சந்தை குறியீட்டு ETF-களில் முதலீடு செய்வதன் மூலம், நீண்ட காலத்தில் சிறந்த இடர்-சீர்செய்யப்பட்ட வருவாயைப் பெற முடியும்.'
    }
  }
];
