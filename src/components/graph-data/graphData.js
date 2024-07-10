// export const hadithData = [
//     {"from": 178179, "to": 89612, "id1": 123231, "id2": 26765, "hadith": "سألت أبا الحسن عليه السلام عن الذى يطوف بعد الغداه و بعد العصر وهو في وقت الصلاه أيصلى ركعات الطواف نافله كان أو فريضه قال لا"},
//     {"from": 178179, "to": 89380, "id1": 123231, "id2": 26519, "hadith": "رأيت العبد عليه السلام و هو محرم و عليه خاتم و هو يطوف طواف الفريضه"},
//     {"from": 178179, "to": 100736, "id1": 123231, "id2": 111713, "hadith": "إن الفريضه هى الطواف الثانى والركعتان الأوليان الطواف الفريضه والركعتان الأخريان والطواف الأول تطوع"},
//     {"from": 178179, "to": 205731, "id1": 123231, "id2": 131696, "hadith": "و يطوف المفرد ما شاء بعد طواف الفريضه ويجدد التلبيه بعد الركعتين والقارن بتلك المنزله ما خلا من الطواف بالتلبيه"},
//     {"from": 178179, "to": 196673, "id1": 123231, "id2": 60003, "hadith": "لا طواف إلا بطهاره و من طاف على غير وضوء لم يعتد بذلك الطواف و من طاف تطوعا على غير وضوء ثم توضأ وصلى ركعتين بعد طوافه فلا بأس بذلك فأما طواف الفريضه فلا يجزى إلا بوضوء"},
//     {"from": 178179, "to": 285559, "id1": 123231, "id2": 157185, "hadith": "و من طاف طواف الفريضه وصلى الركعتين على غير وضوء أعاد الصلاه ولم يعد الطواف"},
//     {"from": 178179, "to": 21227, "id1": 123231, "id2": 1443, "hadith": "وسألت الرضا عليه السلام عن قول الله تبارك وتعالى ليقضوا تفثهم وليوفوا نذورهم قال تقليم الأظفار و طرح الوسخ عنك والخروج من الإحرام وليطوفوا بالبيت طواف الفريضه"},
//     {"from": 178179, "to": 72316, "id1": 123231, "id2": 15731, "hadith": "انه سال محمد بن على الرضا عليهما السالم فقال له سعيت شوطا ثم طلع الفجر قال صل ثم عد فاتم سعيك و طواف الفريضه لما ينبغى ان يتكلم فيه الا بالدعاء وذكر الله وقراءه القرآن قال والنافله يلقى الرجل اخاه"},
//     {"from": 178687, "to": 72316, "id1": 123345, "id2": 15731, "hadith": "انه سال محمد بن على الرضا عليهما السالمم فقال له سعيت شوطا ثم طلع الفجر قال صل ثم عد فاتم سعيك وطواف الفريضه لما ينبغى ان يتكلم فيه الا بالدعاء وذكر الله وقراءه القرآن قال و النافله يلقى الرجل اخاه"},
//     {"from": 178179, "to": 89998, "id1": 123231, "id2": 27194, "hadith": "سألته عن رجل نسى طواف النساء حتى يرجع إلى أهله قال لا تحل له النساء حتى يزور البيت ويطوف فإن مات فليقض عنه وليه فأما ما دام حيا فلا يصلح أن يقضى عنه وإن نسى رمي الجمار فليسا بسواء الرمي سنه و الطوا"},
//     {"from": 178179, "to": 207875, "id1": 123231, "id2": 132803, "hadith": "ولا يصلى لطواف الفريضه ركعتين إلا عند المقام"},
//     {"from": 178179, "to": 90789, "id1": 123231, "id2": 27995, "hadith": "سئل أبو عبد الله عليه السلام و أنا حاضر عن رجل طاف بالبيت ثمانيه أشواط قال نافله أو فريضه فقال فريضه فقال يضيف إليها سته فإذا فرغ صلى ركعتين عند مقام إبراهيم عليه السلام ثم خرج إلى الصفا والمروه فطا"},
//     {"from": 178179, "to": 207828, "id1": 123231, "id2": 132773, "hadith": "و من طاف طواف الفريضه فلم يدر أسته طاف أم سبعه أعاد طوافه فإن فاته طوافه لم يكن عليه شيء"},
//     {"from": 178179, "to": 207832, "id1": 123231, "id2": 132777, "hadith": "و إن طفت بالبيت المفروض ثمانيه أشواط فأعد الطواف و روي يضيف إليها سته فيجعل واحدا فريضه و الاخر نافله"},
//     {"from": 178179, "to": 89613, "id1": 123231, "id2": 26766, "hadith": "ما رأيت الناس أخذوا عن الحسن والحسين عليهما السلام إلا الصلاه بعد العصر و بعد الغداه في طواف الفريضه"},
//     {"from": 178179, "to": 207827, "id1": 123231, "id2": 132772, "hadith": "و إن طفت طواف الفريضه بالبيت فلم تدرسته طفت أم سبعه فأعد الطواف فإن خرجت وفاتك ذلك فليس عليك شيء"},
//     {"from": 178179, "to": 178429, "id1": 123231, "id2": 57808, "hadith": "العليل الذى لا يستطيع الطواف بنفسه يطاف به وإذا لم يستطع الرمي رمى عنه والفرق بينهما أن الطواف فريضه والرمى سنه"},
//     {"from": 178179, "to": 89995, "id1": 123231, "id2": 110278, "hadith": "في قول الله جل ثناوه وليطوفوا بالبيت العتيق قال طواف الفريضه طواف النساء"},
//     {"from": 178179, "to": 100737, "id1": 123231, "id2": 27996, "hadith": "سئل وأنا حاضر عن رجل طاف بالبيت ثمانيه أشواط فقال نافله أو فريضه فقال فريضه قال يضيف إليها سته فإذا فرغ صلى ركعتين عند مقام إبراهيم عليه السلام ثم يخرج إلى الصفا والمروه و يطوف بهما فإذا فرغ صلى رك"},
//     {"from": 178179, "to": 133101, "id1": 123231, "id2": 26676, "hadith": "في رجل طاف شوطا او شوطين ثم خرج مع رجل فى حاجه فقال ان كان طواف نافله بنى عليه و ان كان طواف فريضه لم يبن عليه"},
//     {"from": 178179, "to": 90112, "id1": 123231, "id2": 27192, "hadith": "في قول الله عز وجل وليطوفوا بالبيت العتيق قال طواف الفريضه طواف النساء"},
//     {"from": 178179, "to": 207888, "id1": 123231, "id2": 132814, "hadith": "و من نسی رکعتی طواف الفريضه حتى دخل فى السعى فليحفظ مكانه الذي ذكر فيه ثم ليرجع فليصل الركعتين خلف المقام ثم ليرجع فليتم طوافه بين الصفا والمروه"}
// ]

export const hadithData = [
    {
        "key": "3423",
        "hadith": "ولا خيار إلا على طهر من غير جماع بشهود",
        "color": "light blue"
    },
    {
        "key": "3424",
        "hadith": "لا مباراه إلا على طهر من غير جماع بشهود",
        "color": "light teal"
    },
    {
        "key": "3425",
        "hadith": "لا يكون طلاق و لا تخيیر و لا مباراه إلا على طهر من غير جماع بشهود",
        "color": "light red"
    },
    {
        "key": "3731",
        "hadith": "من صلی خمس صلوات فی اليوم و الليله فی جماعه فظنوا به كل خير و أجیزوا شهادته",
        "color": "light green"
    },
    {
        "key": "8880",
        "hadith": "جاء رجل إلی فاطمه عليها السلام فقال يا ابنه رسول الله هل ترك رسول الله صلی الله عليه و اله عندك شيیا تطرفینیه فقالت يا جاريه هات تلك الحریره فطلبتها فلم تجدها فقالت ويحك اطلبیها فإنها تعدل عندی حسنا",
        "color": "light pink"
    },
    {
        "key": "10070",
        "hadith": "جاءت فاطمه علیها السﻠﺎم تشکو الی رسول الله صلی الله علیه و اله و سلم بعض امرها فاعطاها رسول الله صلی الله علیه و اله و سلم کربه و قال تعلمی ما فیها فاذا فیها من کان یومن بالله و الیوم اﻠﺎخر فﻠﺎ یوذی",
        "color": "light purple"
    },
    {
        "key": "13193",
        "hadith": "ان قدرت ان ﻠﺎ تعرف فافعل و ما علیک الا یثنی علیک الناس و ما علیک ان تکون مذموما عند الناس اذا کنت محمودا عند الله",
        "color": "light yellow"
    },
    {
        "key": "13666",
        "hadith": "الحياء من الإیمان و الإیمان فی الجنه و الرياء من الجفاء و الجفاء فی النار",
        "color": "light orange"
    },
    {
        "key": "13668",
        "hadith": "الحیاء و العفاف و العي اعنی عي اللسان ﻠﺎ عي القلب من اﻠﺎیمان",
        "color": "light turquoise"
    },
    {
        "key": "15041",
        "hadith": "كان لنا أخ يری رأي الإرجاء يقال له عبد الله و كان يطعن علينا فكتبت إلی أبی الحسن عليه السلام أشكوه إليه و أسأله الدعاء فكتب إلي سيرجع حاله إلی ما تحب و إنه لن يموت إلا علی دین الله و سيولد من أم ولد",
        "color": "light red"
    },
    {
        "key": "19439",
        "hadith": "ان استطعت ان ﻠﺎ تعرف فافعل و ما علیک ان لا یثنی علیک الناس و ما علیک ان تکون مذموما عند الناس اذا کنت محمودا عند الله ثم قال قال ابی علی بن ابی طالب علیه السﻠﺎم ﻠﺎ خیر فی العیش الا لرجلین رجل یزداد ک",
        "color": "light blue"
    },
    {
        "key": "31864",
        "hadith": "روي ذلك لا يكون خلع و لا تخيير و لا مباراة إلا على طهر من المرأة من غير جماع و شاهدين يعرفان الرجل و يريان المرأة و يحضران التخيير و إقرار المرأة أنها على طهر من غير جماع من يوم خيرها قال فقال له محم",
        "color": "light teal"
    },
    {
        "key": "38267",
        "hadith": "و الطلاق أن يقول الرجل لامرأته اختاری فإن اختارت نفسها فقد بانت منه و هو خاطب من الخطاب و إن اختارت زوجها فليس بشيء أو يقول أنت طالق فأي ذلك فعل فقد حرمت علیه و لا یكون طلاق و لا خلع و لا مباراة و لا",
        "color": "light red"
    },
    {
        "key": "39960",
        "hadith": "الحياء من الإیمان",
        "color": "light green"
    },
    {
        "key": "39961",
        "hadith": "الحياء من الإیمان و الإیمان فی الجنه",
        "color": "light pink"
    },
    {
        "key": "44645",
        "hadith": "لا طلاق و لا خلع و لا مباراة و لا خيار إلا على طهر من غير جماع",
        "color": "light purple"
    },
    {
        "key": "44823",
        "hadith": "مما علم رسول الله صلی الله علیه و اله فاطمه عليها السلام أن قال لها یا فاطمه من كان یومن بالله و الیوم الاخر فلیکرم ضیفه",
        "color": "light yellow"
    },
    {
        "key": "44824",
        "hadith": "مما علم رسول الله صلی الله علیه و اله علیا عليه السلام قال من كان یومن بالله و الیوم الاخر فلیکرم ضیفه",
        "color": "light orange"
    },
    {
        "key": "46253",
        "hadith": "إن قدرتم أن لا تعرفوا فافعلوا و ما عليك إن لم یثن الناس عليك و ما عليك أن تكون مذموما عند الناس إذا کنت محمودا عند الله تبارک و تعالی إن أمیر المومنین عليه السلام کان یقول لا خیر فی الدنیا إلا لأحد ر",
        "color": "light turquoise"
    }
]

// console.log(hadithData.length)

// const result = hadithData.map(item => {
//     return {...hadithData, "key": parseInt(item['key'])}
// })
//
// console.log(result)

export const relationHadithData = [
    {
        "from": 3425,
        "to": 3423
    },
    {
        "from": 3425,
        "to": 3424
    },
    {
        "from": 8880,
        "to": 39960
    },
    {
        "from": 13666,
        "to": 39961
    },
    {
        "from": 13668,
        "to": 39960
    },
    {
        "from": 19439,
        "to": 13193
    },
    {
        "from": 38267,
        "to": 3423
    },
    {
        "from": 38267,
        "to": 3424
    },
    {
        "from": 38267,
        "to": 44645
    },
    {
        "from": 39961,
        "to": 39960
    },
    {
        "from": 44645,
        "to": 3423
    },
    {
        "from": 44823,
        "to": 44824
    }
]


const resultArray = {
    clusterId: {
        nodes: [
            {
                "groupId-1": 1243,
                "groupId-2": 5364,
                "hadith-1": "",
                "hadith-2": ""
            }
            // ...
        ],
        relations: [
            {
                "from": 2323,
                "to": 2324
            }
            // ...
        ]
    }
}

console.log(array)
// console.log(relationHadithData.length)