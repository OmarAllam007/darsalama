<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Doctor;
use App\Models\Nationality;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DoctorSeeder extends Seeder
{
    private const PHOTO_SOURCE = __DIR__.'/doctor-photos';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $doctors = [
            [
                'name' => 'Dr. Hiba Muhamad Ali',
                'name_ar' => 'د. هبة محمد علي',
                'job' => 'Consultant OB/GYN',
                'job_ar' => 'استشارية نساء وولادة',
                'department' => 'Gynecology',
                'nationality' => 'Sudanese',
                'qualifications' => [
                    ['name' => 'Consultant of Obstetrics & Gynecology', 'name_ar' => 'استشارية أمراض النساء والولادة'],
                ],
                'services' => [
                    ['name' => 'Pregnancy & Delivery Care', 'name_ar' => 'متابعة الحمل والولادة'],
                    ['name' => 'High-Risk Pregnancy', 'name_ar' => 'الحمل عالي الخطورة'],
                    ['name' => 'Gynecological Disorders', 'name_ar' => 'أمراض النساء'],
                    ['name' => 'Menstrual Disorders', 'name_ar' => 'اضطرابات الدورة'],
                    ['name' => 'Infertility Consultation', 'name_ar' => 'استشارات تأخر الإنجاب'],
                    ['name' => 'Family Planning', 'name_ar' => 'تنظيم الأسرة'],
                ],
            ],
            [
                'name' => 'Dr. Hasnaa Saber Hammad',
                'name_ar' => 'د. حسناء صابر محمود حماد',
                'job' => 'OB/GYN Specialist',
                'job_ar' => 'أخصائية نساء وولادة',
                'department' => 'Gynecology',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'Master\'s in OB/GYN', 'name_ar' => 'ماجستير النساء والتوليد'],
                    ['name' => '15 Years Experience', 'name_ar' => 'خبرة ١٥ عاماً'],
                ],
                'services' => [
                    ['name' => 'Antenatal Care', 'name_ar' => 'متابعة الحمل الطبيعي وعالي الخطورة'],
                    ['name' => 'Normal & C-Section Delivery', 'name_ar' => 'الولادة الطبيعية والقيصرية'],
                    ['name' => 'Contraception & IUCD', 'name_ar' => 'وسائل منع الحمل واللولب'],
                    ['name' => 'Gynecological Infections', 'name_ar' => 'علاج الالتهابات النسائية'],
                    ['name' => 'Cervical Cancer Screening', 'name_ar' => 'الكشف المبكر لسرطان عنق الرحم'],
                    ['name' => 'Dilatation & Curettage', 'name_ar' => 'الكحت والتفريغ'],
                ],
            ],
            [
                'name' => 'Dr. Hoyam Haidar Ibrahim',
                'name_ar' => 'د. هيام حيدر إبراهيم',
                'job' => 'OB/GYN Specialist',
                'job_ar' => 'أخصائية نساء وولادة',
                'department' => 'Gynecology',
                'nationality' => 'Sudanese',
                'qualifications' => [
                    ['name' => 'OB/GYN Specialist', 'name_ar' => 'أخصائية أمراض النساء والتوليد'],
                    ['name' => 'Full Member, Royal College of Physicians of Ireland', 'name_ar' => 'عضوية كاملة بالكلية الملكية الأيرلندية'],
                    ['name' => 'Certified in OB/GYN Ultrasound', 'name_ar' => 'شهادة الموجات فوق الصوتية في النساء والتوليد'],
                    ['name' => 'Diploma in Aesthetic Gynecology', 'name_ar' => 'دبلومة طب النساء التجميلي'],
                    ['name' => '16 Years Experience', 'name_ar' => 'خبرة ١٦ عاماً'],
                ],
                'services' => [
                    ['name' => 'Antenatal Care & Ultrasound', 'name_ar' => 'متابعة الحمل بالموجات فوق الصوتية'],
                    ['name' => 'High-Risk Pregnancy', 'name_ar' => 'متابعة وعلاج الحمل المعقد'],
                    ['name' => 'Recurrent Miscarriage', 'name_ar' => 'علاج الإجهاض المتكرر'],
                    ['name' => 'Menstrual Disorders', 'name_ar' => 'اضطرابات الدورة الشهرية'],
                    ['name' => 'Post-Menopausal Care', 'name_ar' => 'مشكلات ما بعد انقطاع الطمث'],
                    ['name' => 'Aesthetic Gynecology', 'name_ar' => 'طب النساء التجميلي'],
                ],
            ],
            [
                'name' => 'Dr. Shamila Yaser',
                'name_ar' => 'د. شمائل ياسر',
                'job' => 'Consultant OB/GYN',
                'job_ar' => 'استشارية نساء وولادة',
                'department' => 'Gynecology',
                'nationality' => 'Pakistani',
                'qualifications' => [
                    ['name' => 'Consultant OB/GYN', 'name_ar' => 'استشارية نساء وولادة'],
                    ['name' => 'FCPS (Pakistan)', 'name_ar' => 'FCPS باكستان'],
                    ['name' => 'MCPS (Pakistan)', 'name_ar' => 'MCPS باكستان'],
                    ['name' => 'MRCOG Part 2 (UK)', 'name_ar' => 'MRCOG المملكة المتحدة'],
                    ['name' => '23+ Years Experience', 'name_ar' => 'خبرة أكثر من ٢٣ عاماً'],
                ],
                'services' => [
                    ['name' => 'Pregnancy & Delivery Care', 'name_ar' => 'متابعة الحمل والولادة'],
                    ['name' => 'High-Risk Pregnancy', 'name_ar' => 'الحمل عالي الخطورة'],
                    ['name' => 'PCOS & Hormonal Disorders', 'name_ar' => 'تكيس المبايض والاضطرابات الهرمونية'],
                    ['name' => 'Fibroids & Ovarian Cysts', 'name_ar' => 'الأورام الليفية وأكياس المبيض'],
                    ['name' => 'OB/GYN Ultrasound', 'name_ar' => 'السونار النسائي والتوليدي'],
                    ['name' => 'Hysteroscopy & Laparoscopy', 'name_ar' => 'تنظير الرحم والبطن'],
                    ['name' => 'Fertility Consultation', 'name_ar' => 'استشارات الخصوبة'],
                    ['name' => 'Menopause Management', 'name_ar' => 'رعاية سن اليأس'],
                    ['name' => 'Gynecological Disorders', 'name_ar' => 'الأمراض النسائية'],
                    ['name' => 'Menstrual Disorders', 'name_ar' => 'اضطرابات الدورة الشهرية'],
                    ['name' => 'Family Planning', 'name_ar' => 'تنظيم الأسرة'],
                ],
            ],
            [
                'name' => 'Dr. Muhannad Hamarsha',
                'name_ar' => 'د. مهند حمارشه',
                'job' => 'Consultant — OB/GYN Surgery',
                'job_ar' => 'استشاري أمراض وجراحة النساء والتوليد',
                'department' => 'Gynecology',
                'nationality' => 'Jordanian',
                'qualifications' => [
                    ['name' => 'Jordanian Board & Higher Specialty in OB/GYN Surgery', 'name_ar' => 'حاصل على البورد الأردني والاختصاص العالي في جراحة النساء والولادة'],
                    ['name' => 'Fellow, Royal College of Physicians of Ireland', 'name_ar' => 'زميل الكلية الملكية الأيرلندية للأطباء'],
                    ['name' => 'Fellow, World Assoc. of Laparoscopic Surgeons (USA)', 'name_ar' => 'زميل الرابطة العالمية لجراحة المناظير، أمريكا'],
                    ['name' => 'Member, World Society of Cosmetic Gynecology (Turkey)', 'name_ar' => 'عضو الجمعية العالمية للجراحة التجميلية النسائية، تركيا'],
                    ['name' => 'Member, Jordanian Society of Fertility & Genetics', 'name_ar' => 'عضو الجمعية الأردنية للإخصاب والوراثة'],
                ],
                'services' => [
                    ['name' => 'Pregnancy, Natural & Cesarean Delivery', 'name_ar' => 'متابعة الحمل والولادة الطبيعية والقيصرية'],
                    ['name' => 'Pelvic Reconstructive Surgery & Incontinence', 'name_ar' => 'جراحات الحوض الترميمية وسلس البول'],
                    ['name' => 'Aesthetic Gynecology & Injectables', 'name_ar' => 'جراحات وحقن التجميل النسائية'],
                    ['name' => 'Laparoscopy & Hysteroscopy', 'name_ar' => 'عمليات تنظير البطن وتنظير الرحم'],
                    ['name' => 'Gynecological Disorders', 'name_ar' => 'الأمراض النسائية'],
                    ['name' => 'Menstrual Disorders', 'name_ar' => 'اضطرابات الدورة الشهرية'],
                    ['name' => 'High-Risk Pregnancy', 'name_ar' => 'الحمل عالي الخطورة'],
                    ['name' => 'Family Planning', 'name_ar' => 'تنظيم الأسرة'],
                ],
            ],
            [
                'name' => 'Dr. Amira Tabl',
                'name_ar' => 'د. أميرة طبل',
                'job' => 'OB/GYN Specialist',
                'job_ar' => 'أخصائية نساء وولادة',
                'department' => 'Gynecology',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'Specialist in Obstetrics & Gynecology', 'name_ar' => 'أخصائية أمراض النساء والتوليد'],
                ],
                'services' => [
                    ['name' => 'Pregnancy Follow-up', 'name_ar' => 'متابعة الحمل'],
                    ['name' => 'Normal & Cesarean Delivery', 'name_ar' => 'الولادة الطبيعية والقيصرية'],
                    ['name' => 'Gynecological Disorders', 'name_ar' => 'الأمراض النسائية'],
                    ['name' => 'Menstrual Disorders', 'name_ar' => 'اضطرابات الدورة الشهرية'],
                    ['name' => 'Family Planning', 'name_ar' => 'تنظيم الأسرة'],
                ],
            ],
            [
                'name' => 'Dr. Rabab Salem',
                'name_ar' => 'د. رباب سالم',
                'job' => 'Consultant Pediatrician',
                'job_ar' => 'استشاري طب الأطفال',
                'department' => 'Pediatrics',
                'nationality' => 'Libyan',
                'qualifications' => [
                    ['name' => 'Consultant Pediatrician', 'name_ar' => 'استشاري طب الأطفال'],
                ],
                'services' => [
                    ['name' => 'Newborn Care', 'name_ar' => 'رعاية حديثي الولادة'],
                    ['name' => 'Growth Monitoring', 'name_ar' => 'متابعة النمو'],
                    ['name' => 'Vaccinations', 'name_ar' => 'التطعيمات'],
                    ['name' => 'Childhood Illnesses', 'name_ar' => 'أمراض الأطفال'],
                    ['name' => 'Respiratory Infections', 'name_ar' => 'عدوى الجهاز التنفسي'],
                    ['name' => 'Nutrition Guidance', 'name_ar' => 'إرشادات التغذية'],
                    ['name' => 'Pediatric Blood Disorders', 'name_ar' => 'أمراض الدم عند الأطفال'],
                ],
            ],
            [
                'name' => 'Dr. Nagwa Ahmed Saad Habiba',
                'name_ar' => 'د. نجوى أحمد سعد حبيبة',
                'job' => 'Pediatrics Specialist',
                'job_ar' => 'أخصائية طب الأطفال',
                'department' => 'Pediatrics',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'Master\'s in Pediatrics, Ain Shams University (2009)', 'name_ar' => 'ماجستير طب الأطفال، جامعة عين شمس ٢٠٠٩'],
                    ['name' => 'MRCPCH 2023', 'name_ar' => 'الزمالة البريطانية لطب الأطفال'],
                    ['name' => '20+ Years Experience', 'name_ar' => 'خبرة أكثر من ٢٠ عاماً'],
                ],
                'services' => [
                    ['name' => 'Newborn Follow-up & Care', 'name_ar' => 'متابعة وعلاج حديثي الولادة'],
                    ['name' => 'Growth & Development Monitoring', 'name_ar' => 'متابعة النمو والتطور العقلي'],
                    ['name' => 'Vaccinations & Check-ups', 'name_ar' => 'التطعيمات والفحوصات الدورية'],
                    ['name' => 'Respiratory & Digestive Illness', 'name_ar' => 'أمراض الجهاز التنفسي والهضمي'],
                    ['name' => 'Pediatric Blood Disorders', 'name_ar' => 'أمراض الدم عند الأطفال'],
                    ['name' => 'Acute & Chronic Diseases', 'name_ar' => 'الأمراض الحادة والمزمنة'],
                ],
            ],
            [
                'name' => 'Dr. Reham Wahba Abdraboh Elbohy',
                'name_ar' => 'د. ريهام وهبة عبد ربه البوهي',
                'job' => 'Pediatric & Neonatology Specialist',
                'job_ar' => 'أخصائية طب الأطفال وحديثي الولادة',
                'department' => 'Pediatrics',
                'nationality' => 'Egyptian',
                'photo' => 'reham-wahba.jpg',
                'qualifications' => [
                    ['name' => 'MRCPCH (UK) — Member of the Royal College of Paediatrics and Child Health', 'name_ar' => 'عضوية الكلية الملكية لطب الأطفال وصحة الطفل (MRCPCH)'],
                    ['name' => 'Master\'s Degree in Pediatrics and Neonatology, Alexandria University', 'name_ar' => 'ماجستير طب الأطفال وحديثي الولادة، جامعة الإسكندرية'],
                    ['name' => 'Over 14 Years of Experience in Saudi Arabia & Egypt', 'name_ar' => 'خبرة أكثر من ١٤ عاماً في السعودية ومصر'],
                    ['name' => 'Extensive Experience in NICU, PICU & Pediatric Emergency', 'name_ar' => 'خبرة واسعة في العناية المركزة لحديثي الولادة والأطفال وطوارئ الأطفال'],
                ],
                'services' => [
                    ['name' => 'Newborn & Premature Baby Care', 'name_ar' => 'متابعة حديثي الولادة والأطفال المبتسرين'],
                    ['name' => 'Growth, Nutrition & Vaccination Follow-up', 'name_ar' => 'متابعة النمو والتغذية والتطعيمات'],
                    ['name' => 'Respiratory Diseases (Asthma, Allergy, Pneumonia)', 'name_ar' => 'أمراض الجهاز التنفسي (الربو، الحساسية، الالتهاب الرئوي)'],
                    ['name' => 'Gastrointestinal Disorders (Diarrhea, Vomiting, Reflux & Feeding Problems)', 'name_ar' => 'أمراض الجهاز الهضمي (الإسهال، القيء، الارتجاع ومشكلات التغذية)'],
                    ['name' => 'Infectious Diseases & Recurrent Fever', 'name_ar' => 'الأمراض المعدية والحمى المتكررة'],
                    ['name' => 'Blood Disorders (Anemia, Thalassemia, Sickle Cell)', 'name_ar' => 'أمراض الدم (الأنيميا، الثلاسيميا، الأنيميا المنجلية)'],
                    ['name' => 'Pediatric Diabetes & Endocrine Disorders', 'name_ar' => 'سكري الأطفال واضطرابات الغدد الصماء'],
                    ['name' => 'Kidney & Urinary Tract Disorders & Enuresis', 'name_ar' => 'أمراض الكلى والمسالك البولية والتبول اللاإرادي'],
                    ['name' => 'Skin Diseases & Allergic Conditions', 'name_ar' => 'الأمراض الجلدية والحساسية'],
                    ['name' => 'Emergency Evaluation & Treatment', 'name_ar' => 'تقييم وعلاج الحالات الطارئة للأطفال'],
                ],
            ],
            [
                'name' => 'Dr. Mohammad Sami Montaser',
                'name_ar' => 'د. محمد سامي منتصر',
                'job' => 'Pediatric & Neonatology Specialist',
                'job_ar' => 'أخصائي الأطفال وحديثي الولادة',
                'department' => 'Pediatrics',
                'nationality' => 'Egyptian',
                'photo' => 'mohammad-sami.jpg',
                'qualifications' => [
                    ['name' => 'Master\'s Degree in Pediatrics — Egypt (2013)', 'name_ar' => 'ماجستير طب الأطفال — مصر ٢٠١٣'],
                    ['name' => 'Over 15 Years of Experience in Pediatrics and Neonatology', 'name_ar' => 'خبرة أكثر من ١٥ عاماً في طب الأطفال وحديثي الولادة'],
                ],
                'services' => [
                    ['name' => 'Newborn & Premature Baby Care', 'name_ar' => 'متابعة حديثي الولادة والأطفال المبتسرين'],
                    ['name' => 'Growth, Nutrition & Vaccination Follow-up', 'name_ar' => 'متابعة النمو والتغذية والتطعيمات'],
                    ['name' => 'Respiratory Diseases (Asthma, Allergy, Pneumonia)', 'name_ar' => 'أمراض الجهاز التنفسي (الربو، الحساسية، الالتهاب الرئوي)'],
                    ['name' => 'Gastrointestinal Disorders', 'name_ar' => 'أمراض الجهاز الهضمي'],
                    ['name' => 'Infectious Diseases & Recurrent Fever', 'name_ar' => 'الأمراض المعدية والحمى المتكررة'],
                    ['name' => 'Blood Disorders', 'name_ar' => 'أمراض الدم'],
                    ['name' => 'Emergency Evaluation & Treatment', 'name_ar' => 'تقييم وعلاج الحالات الطارئة للأطفال'],
                ],
            ],
            [
                'name' => 'Dr. Emad Sobhi Elhariry',
                'name_ar' => 'د. عماد صبحي الحريري',
                'job' => 'Internal Medicine Specialist',
                'job_ar' => 'أخصائي أمراض الباطنة',
                'department' => 'Internal Medicine',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'MBBCh, Alexandria University (2000)', 'name_ar' => 'بكالوريوس الطب، جامعة الإسكندرية (٢٠٠٠)'],
                    ['name' => 'Master’s in Internal Medicine, Ain Shams University (2007)', 'name_ar' => 'ماجستير الباطنة، جامعة عين شمس (٢٠٠٧)'],
                    ['name' => 'MD in Internal Medicine, Menoufia (2022)', 'name_ar' => 'دكتوراه الباطنة، جامعة المنوفية (٢٠٢٢)'],
                    ['name' => '15+ Years Experience', 'name_ar' => 'خبرة أكثر من ١٥ عاماً'],
                ],
                'services' => [
                    ['name' => 'Diabetes', 'name_ar' => 'السكري'],
                    ['name' => 'Hypertension', 'name_ar' => 'ارتفاع ضغط الدم'],
                    ['name' => 'Asthma & COPD', 'name_ar' => 'الربو وأمراض الصدر'],
                    ['name' => 'Dyslipidemia', 'name_ar' => 'اضطرابات الدهون'],
                    ['name' => 'Liver & GI Disorders', 'name_ar' => 'الكبد والجهاز الهضمي'],
                    ['name' => 'Infectious Diseases', 'name_ar' => 'الأمراض المعدية والحمى'],
                ],
            ],
            [
                'name' => 'Dr. Rasha Ibrahim Salama',
                'name_ar' => 'د. رشا إبراهيم سلامة',
                'job' => 'Consultant Internal Medicine & GI',
                'job_ar' => 'استشاري باطنة وجهاز هضمي',
                'department' => 'Internal Medicine',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'Doctorate in Gastroenterology, Hepatology & Infectious Diseases', 'name_ar' => 'دكتوراة الباطنة — جهاز هضمي وكبد وأمراض معدية'],
                    ['name' => 'Consultant Internal Medicine', 'name_ar' => 'استشاري الباطنة'],
                    ['name' => '20+ Years Experience', 'name_ar' => 'خبرة أكثر من ٢٠ عاماً'],
                ],
                'services' => [
                    ['name' => 'Upper Endoscopy & Colonoscopy', 'name_ar' => 'مناظير المعدة والقولون'],
                    ['name' => 'Gastric Balloon for Obesity', 'name_ar' => 'علاج السمنة ببالون المعدة'],
                    ['name' => 'Fatty Liver Treatment', 'name_ar' => 'علاج الكبد الدهني'],
                    ['name' => 'Hepatitis B & C Treatment', 'name_ar' => 'علاج فيروسات الكبد B و C'],
                    ['name' => 'Cirrhosis Management', 'name_ar' => 'علاج تليف الكبد ومضاعفاته'],
                    ['name' => 'IBS & IBD Care', 'name_ar' => 'القولون العصبي والتقرحي'],
                    ['name' => 'GI Bleeding & Anemia', 'name_ar' => 'علاج النزيف والأنيميا'],
                    ['name' => 'pH-metry & Manometry', 'name_ar' => 'قياس حموضة وحركية المريء'],
                    ['name' => 'Diabetes & Hypertension', 'name_ar' => 'السكري وضغط الدم'],
                    ['name' => 'Dyslipidemia', 'name_ar' => 'اضطرابات الدهون'],
                ],
            ],
            [
                'name' => 'Dr. Magdy Mohamed Dwidar',
                'name_ar' => 'د. مجدي دويدار',
                'job' => 'Internal Medicine Specialist',
                'job_ar' => 'أخصائي أمراض الباطنة',
                'department' => 'Internal Medicine',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'MBBCh, Ain Shams University', 'name_ar' => 'بكالوريوس الطب، جامعة عين شمس'],
                    ['name' => 'Master\'s in Internal Medicine (2012), Ain Shams University', 'name_ar' => 'ماجستير الأمراض الباطنية ٢٠١٢، جامعة عين شمس'],
                    ['name' => '12 Years Experience', 'name_ar' => 'خبرة ١٢ عاماً'],
                ],
                'services' => [
                    ['name' => 'General Health Cases', 'name_ar' => 'حالات الصحة العامة'],
                    ['name' => 'Diabetes & Hypertension', 'name_ar' => 'السكري وضغط الدم'],
                    ['name' => 'Dyslipidemia & Endocrine', 'name_ar' => 'اعتلال دهون الدم والغدد'],
                    ['name' => 'Respiratory & GIT Cases', 'name_ar' => 'الجهاز التنفسي والهضمي'],
                ],
            ],
            [
                'name' => 'Dr. Kamal Abdulkhaleq',
                'name_ar' => 'د. كمال عبد الخالق',
                'job' => 'Consultant – Internal Medicine, Endocrinology & Diabetes',
                'job_ar' => 'استشاري الطب الباطني وأمراض الغدد والسكر',
                'department' => 'Internal Medicine',
                'nationality' => null,
                'qualifications' => [
                    ['name' => 'Consultant – Internal Medicine, Endocrinology & Diabetes', 'name_ar' => 'استشاري الطب الباطني وأمراض الغدد والسكر'],
                ],
                'services' => [
                    ['name' => 'Internal Medicine', 'name_ar' => 'الطب الباطني'],
                    ['name' => 'Endocrinology', 'name_ar' => 'الغدد الصماء'],
                    ['name' => 'Diabetes Management', 'name_ar' => 'علاج السكري'],
                    ['name' => 'Thyroid Disorders', 'name_ar' => 'أمراض الغدة الدرقية'],
                    ['name' => 'Hormonal Imbalance', 'name_ar' => 'الاضطرابات الهرمونية'],
                    ['name' => 'Osteoporosis', 'name_ar' => 'هشاشة العظام'],
                    ['name' => 'Obesity & Metabolism', 'name_ar' => 'السمنة والتمثيل الغذائي'],
                ],
            ],
            [
                'name' => 'Dr. Manal Matar Al-Anazi',
                'name_ar' => 'د. منال مطر العنزي',
                'job' => 'Consultant Internist & Pulmonologist',
                'job_ar' => 'استشارية الباطنة والأمراض الصدرية',
                'department' => 'Internal Medicine',
                'nationality' => 'Saudi',
                'qualifications' => [
                    ['name' => 'Saudi Board Certified in Internal Medicine', 'name_ar' => 'البورد السعودي لطب الباطنة'],
                    ['name' => 'Saudi Board Certified in Pulmonary Medicine', 'name_ar' => 'البورد السعودي لأمراض الصدر للكبار'],
                    ['name' => 'European Diploma in Adult Respiratory Medicine', 'name_ar' => 'دبلوم أوروبي في طب الصدرية'],
                    ['name' => '15 Years Experience', 'name_ar' => 'خبرة ١٥ عاماً'],
                ],
                'services' => [
                    ['name' => 'Airway Diseases', 'name_ar' => 'أمراض المجاري الهوائية'],
                    ['name' => 'Interstitial Lung Disease', 'name_ar' => 'أمراض الرئة الخلالية (التليف الرئوي)'],
                    ['name' => 'Pleural Diseases', 'name_ar' => 'أمراض الغشاء البلوري'],
                    ['name' => 'Lung Cancer', 'name_ar' => 'أورام الرئة'],
                    ['name' => 'Pulmonary Embolism & Hypertension', 'name_ar' => 'التجلطات الرئوية وارتفاع ضغط الشريان الرئوي'],
                    ['name' => 'Chest Infections', 'name_ar' => 'التهابات الصدر'],
                ],
            ],
            [
                'name' => 'Dr. Ehab Mohamed Abdulwahab',
                'name_ar' => 'د. إيهاب محمد عبدالوهاب',
                'job' => 'General Surgery Specialist',
                'job_ar' => 'أخصائي جراحة عامة',
                'department' => 'General Surgery',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'Master\'s in General Surgery', 'name_ar' => 'ماجستير الجراحة العامة'],
                    ['name' => 'MRCS England', 'name_ar' => 'عضو الكلية الملكية للجراحين بإنجلترا'],
                    ['name' => '20+ Years Experience', 'name_ar' => 'خبرة أكثر من ٢٠ عاماً'],
                ],
                'services' => [
                    ['name' => 'Lipoma & Cysts', 'name_ar' => 'الأورام الدهنية والأكياس'],
                    ['name' => 'Diagnostic Biopsies', 'name_ar' => 'الخزعات التشخيصية'],
                    ['name' => 'Benign Breast Lumps', 'name_ar' => 'أورام الثدي الحميدة'],
                    ['name' => 'Hernia Repair', 'name_ar' => 'الفتق الإربي والسري وجدار البطن'],
                    ['name' => 'Appendectomy', 'name_ar' => 'استئصال الزائدة'],
                    ['name' => 'Hemorrhoids, Fissure & Fistula', 'name_ar' => 'البواسير والشرخ والناسور'],
                    ['name' => 'Pilonidal Sinus', 'name_ar' => 'الناسور العصعصي (كيس الشعر)'],
                    ['name' => 'Diabetic Foot & Burns Care', 'name_ar' => 'العناية بجروح القدم السكري والحروق'],
                ],
            ],
            [
                'name' => 'Dr. Sarah Al Katheer',
                'name_ar' => 'د. سارة الكثير',
                'job' => 'Senior Registrar in General Surgery',
                'job_ar' => 'نائب أول في الجراحة العامة',
                'department' => 'General Surgery',
                'nationality' => 'Saudi',
                'qualifications' => [
                    ['name' => 'Specialist in General Surgery', 'name_ar' => 'أخصائية الجراحة العامة'],
                ],
                'services' => [
                    ['name' => 'General Surgery', 'name_ar' => 'الجراحة العامة'],
                    ['name' => 'Hernia Repair', 'name_ar' => 'إصلاح الفتق'],
                    ['name' => 'Gallbladder Surgery', 'name_ar' => 'جراحة المرارة'],
                    ['name' => 'Appendectomy', 'name_ar' => 'استئصال الزائدة'],
                ],
            ],
            [
                'name' => 'Dr. Ahmed Taha Elsherbini',
                'name_ar' => 'د. أحمد طه الشربيني',
                'job' => 'General Surgery Consultant',
                'job_ar' => 'استشاري الجراحة العامة',
                'department' => 'General Surgery',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'General Surgery Consultant', 'name_ar' => 'استشاري الجراحة العامة'],
                    ['name' => 'Mansoura University', 'name_ar' => 'جامعة المنصورة'],
                ],
                'services' => [
                    ['name' => 'Laparoscopic Cholecystectomy & Appendectomy', 'name_ar' => 'استئصال المرارة والزائدة بالمنظار'],
                    ['name' => 'Laparoscopic Hernia Repair & Hyperhidrosis', 'name_ar' => 'إصلاح الفتق بالمنظار وجراحة فرط التعرق'],
                    ['name' => 'Abdominal Wall & GI Surgery', 'name_ar' => 'جراحة جدار البطن والجهاز الهضمي'],
                    ['name' => 'Thyroid & Salivary Gland Surgery', 'name_ar' => 'جراحة الغدة الدرقية والغدد اللعابية'],
                    ['name' => 'Anal Surgery — Hemorrhoids & Fistula', 'name_ar' => 'جراحات الشرج — البواسير والناسور'],
                    ['name' => 'Lipoma & Cysts', 'name_ar' => 'الأورام الدهنية والأكياس'],
                    ['name' => 'Benign Breast Lumps', 'name_ar' => 'أورام الثدي الحميدة'],
                    ['name' => 'Pilonidal Sinus', 'name_ar' => 'الناسور العصعصي (كيس الشعر)'],
                ],
            ],
            /*
             * Not in the departments page markup — the site keeps him in its
             * Firestore custom_doctors collection, where the card's name field
             * reads "Sameh Barayan - Vascular & Bariatric ) PT". Only the name
             * and specialty are salvageable from that; the Arabic name is a
             * transliteration and the rest is waiting on the admin.
             */
            [
                'name' => 'Dr. Sameh Barayan',
                'name_ar' => 'د. سامح بريان',
                'job' => 'Vascular & Bariatric Surgeon',
                'job_ar' => 'جراح الأوعية الدموية والسمنة',
                'department' => 'General Surgery',
                'nationality' => null,
                'qualifications' => [],
                'services' => [],
            ],
            [
                'name' => 'Dr. Safwan Abdulrahman Jamal',
                'name_ar' => 'د. صفوان عبدالرحمن جمال',
                'job' => 'Orthopedic Surgeon',
                'job_ar' => 'أخصائي جراحة العظام',
                'department' => 'Orthopedics',
                'nationality' => 'Lebanese',
                'qualifications' => [
                    ['name' => 'Clinical Residency in Orthopedic Surgery & Traumatology', 'name_ar' => 'الإقامة التخصصية في جراحة العظام والكسور'],
                    ['name' => '16 Years Experience', 'name_ar' => 'خبرة ١٦ عاماً'],
                ],
                'services' => [
                    ['name' => 'Fractures & Trauma', 'name_ar' => 'علاج الكسور والإصابات'],
                    ['name' => 'Hip & Knee Replacement', 'name_ar' => 'استبدال مفصل الورك والركبة'],
                    ['name' => 'Knee Arthroscopy', 'name_ar' => 'مناظير الركبة'],
                    ['name' => 'Sports Injuries', 'name_ar' => 'الإصابات الرياضية'],
                    ['name' => 'Tendon & Ligament Repair', 'name_ar' => 'إصلاح الأوتار والأربطة'],
                    ['name' => 'Osteoarthritis', 'name_ar' => 'خشونة المفاصل'],
                    ['name' => 'Pediatric Fractures', 'name_ar' => 'كسور الأطفال'],
                    ['name' => 'Joint Injection & Aspiration', 'name_ar' => 'حقن وبزل المفاصل'],
                ],
            ],
            [
                'name' => 'Dr. Osama Ahmed Abdelmagied Abdelsalaam',
                'name_ar' => 'د. أسامه أحمد عبد المجيد عبد السلام',
                'job' => 'Orthopedic Consultant',
                'job_ar' => 'استشاري جراحة العظام',
                'department' => 'Orthopedics',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'Egyptian Fellowship in Orthopedics (2018)', 'name_ar' => 'الزمالة المصرية لجراحة العظام ٢٠١٨'],
                    ['name' => 'Diploma in Deformity Correction (2026)', 'name_ar' => 'الدبلوم التخصصي في إصلاح التشوهات ٢٠٢٦'],
                    ['name' => '15 Years Experience', 'name_ar' => 'خبرة ١٥ عاماً'],
                ],
                'services' => [
                    ['name' => 'Fracture Management — Surgical & Conservative', 'name_ar' => 'علاج جميع حالات الكسور جراحياً وتحفظياً'],
                    ['name' => 'Joint & Ligament Injections', 'name_ar' => 'حقن جميع المفاصل والأربطة'],
                    ['name' => 'Tendon Repair & Release', 'name_ar' => 'عمليات إصلاح وتحرير الأوتار'],
                    ['name' => 'Joint Replacement — Knee & Hip', 'name_ar' => 'عمليات المفاصل الصناعية'],
                    ['name' => 'Ilizarov — Deformity & Complex Fractures', 'name_ar' => 'علاج التشوهات والكسور المعقدة بجهاز الإليزاروف'],
                    ['name' => 'Sports Medicine — Knee & Shoulder', 'name_ar' => 'الطب الرياضي للركبة والكتف والعضلات'],
                    ['name' => 'Knee Arthroscopy', 'name_ar' => 'مناظير الركبة'],
                    ['name' => 'Osteoarthritis', 'name_ar' => 'خشونة المفاصل'],
                ],
            ],
            [
                'name' => 'Dr. Mona Sayed Abdelfatah Ibrahim',
                'name_ar' => 'د. منى سيد عبد الفتاح إبراهيم',
                'job' => 'Dermatology Registrar',
                'job_ar' => 'نائب الأمراض الجلدية',
                'department' => 'Dermatology',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'Dermatology Registrar', 'name_ar' => 'نائب الأمراض الجلدية'],
                    ['name' => 'Master\'s in Dermatology (2017), Al-Azhar University', 'name_ar' => 'ماجستير الأمراض الجلدية ٢٠١٧، جامعة الأزهر'],
                    ['name' => 'MBBS (2006), Ain Shams University', 'name_ar' => 'بكالوريوس الطب والجراحة ٢٠٠٦، جامعة عين شمس'],
                    ['name' => '10 Years Experience', 'name_ar' => 'خبرة ١٠ سنوات'],
                ],
                'services' => [
                    ['name' => 'Acute & Chronic Skin Diseases', 'name_ar' => 'الأمراض الجلدية الحادة والمزمنة'],
                    ['name' => 'Minor Skin Procedures', 'name_ar' => 'العمليات الجلدية الصغرى'],
                    ['name' => 'Cautery, Injections & Biopsy', 'name_ar' => 'الكي والحقن الموضعي وخزعات الجلد'],
                    ['name' => 'Laser & Aesthetic Injectables', 'name_ar' => 'الليزر والحقن التجميلي للبشرة والشعر'],
                ],
            ],
            [
                'name' => 'Dr. Hassan Hamza Almir',
                'name_ar' => 'د. حسن حمزه المير',
                'job' => 'Consultant Cardiologist',
                'job_ar' => 'استشاري أمراض القلب',
                'department' => 'Cardiology',
                'nationality' => 'Saudi',
                'qualifications' => [
                    ['name' => 'Consultant Cardiology — Saudi Commission for Health Specialties (SCFHS)', 'name_ar' => 'استشاري أمراض قلب كبار — الهيئة السعودية للتخصصات الصحية'],
                    ['name' => 'Consultant Internal Medicine — Saudi Commission for Health Specialties (SCFHS)', 'name_ar' => 'استشاري باطنية — الهيئة السعودية للتخصصات الصحية'],
                ],
                'services' => [
                    ['name' => 'Coronary Artery Disease & Angina', 'name_ar' => 'الشرايين التاجية والذبحة الصدرية'],
                    ['name' => 'Cardiac Arrhythmias', 'name_ar' => 'اضطرابات نظم القلب'],
                    ['name' => 'Hypertension & Dyslipidemia', 'name_ar' => 'ضغط الدم واعتلال الدهون'],
                    ['name' => 'Heart Failure', 'name_ar' => 'فشل وضعف عضلة القلب'],
                    ['name' => 'Heart Valve Diseases', 'name_ar' => 'أمراض صمامات القلب'],
                    ['name' => 'Echo, Stress Test & Holter', 'name_ar' => 'إيكو القلب وتخطيط الجهد وهولتر'],
                ],
            ],
            [
                'name' => 'Dr. Mohamed Ahmed Attia',
                'name_ar' => 'د. محمد أحمد عطية',
                'job' => 'Cardiology Specialist',
                'job_ar' => 'أخصائي أمراض القلب',
                'department' => 'Cardiology',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'MBBCh, Zagazig University (2002)', 'name_ar' => 'بكالوريوس الطب، جامعة الزقازيق ٢٠٠٢'],
                    ['name' => 'Master\'s in Cardiovascular Medicine, Zagazig (2010)', 'name_ar' => 'ماجستير أمراض القلب والأوعية الدموية ٢٠١٠'],
                    ['name' => 'First Consultant of Cardiology — Egyptian Medical Syndicate', 'name_ar' => 'استشاري أول أمراض القلب — نقابة أطباء مصر'],
                    ['name' => '20+ Years Experience', 'name_ar' => 'خبرة أكثر من ٢٠ عاماً'],
                ],
                'services' => [
                    ['name' => 'Coronary Artery Disease & Angina', 'name_ar' => 'الشرايين التاجية والذبحة الصدرية'],
                    ['name' => 'Cardiac Arrhythmias', 'name_ar' => 'اضطرابات نظم القلب'],
                    ['name' => 'Hypertension & Dyslipidemia', 'name_ar' => 'ضغط الدم واعتلال الدهون'],
                    ['name' => 'Heart Failure', 'name_ar' => 'فشل وضعف عضلة القلب'],
                    ['name' => 'Heart Valve Diseases', 'name_ar' => 'أمراض صمامات القلب'],
                    ['name' => 'Echo, Stress Test & Holter', 'name_ar' => 'إيكو القلب وتخطيط الجهد وهولتر'],
                ],
            ],
            [
                'name' => 'Dr. Reda Fathy',
                'name_ar' => 'د. رضا فتحي محمد',
                'job' => 'Senior ENT Specialist',
                'job_ar' => 'أخصائي أول أنف وأذن وحنجرة',
                'department' => 'ENT',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'ENT Senior Specialist', 'name_ar' => 'دكتوراة جراحة الأذن والأنف والحنجرة، جامعة عين شمس'],
                    ['name' => 'Master\'s Degree, Ain Shams University', 'name_ar' => 'ماجستير جراحة الأذن والأنف والحنجرة'],
                    ['name' => 'Diploma of Endoscopy, Ain Shams / Marseille', 'name_ar' => 'دبلومة جراحة المناظير الأنفية'],
                    ['name' => 'Member, Egyptian ORL Society', 'name_ar' => 'عضو الجمعية المصرية لجراحة الأذن والأنف والحنجرة'],
                ],
                'services' => [
                    ['name' => 'Hearing Problems', 'name_ar' => 'تشخيص وعلاج ضعف السمع'],
                    ['name' => 'Nasal Obstruction', 'name_ar' => 'علاج انسداد الأنف'],
                    ['name' => 'Nasal Endoscopy & Surgery', 'name_ar' => 'مناظير وجراحة الأنف'],
                    ['name' => 'Pediatric Ear Ventilation Tubes', 'name_ar' => 'أنابيب تهوية الأذن للأطفال'],
                    ['name' => 'Tonsil & Adenoid Surgery', 'name_ar' => 'عمليات اللوز واللحمية'],
                    ['name' => 'Tympanoplasty', 'name_ar' => 'ترقيع طبلة الأذن'],
                    ['name' => 'Audiogram & Tympanometry', 'name_ar' => 'قياس السمع وضغط الأذن'],
                    ['name' => 'Voice / Laryngeal Surgery', 'name_ar' => 'جراحات الأحبال الصوتية'],
                ],
            ],
            [
                'name' => 'Dr. Eyad Atieh',
                'name_ar' => 'د. إياد عطية',
                'job' => 'Ophthalmology Specialist',
                'job_ar' => 'أخصائي طب العيون',
                'department' => 'Ophthalmology',
                'nationality' => 'Syrian',
                'qualifications' => [
                    ['name' => 'Master in Ophthalmology', 'name_ar' => 'ماجستير أمراض العين وجراحتها'],
                    ['name' => '20 Years Experience', 'name_ar' => 'خبرة ٢٠ عاماً'],
                ],
                'services' => [
                    ['name' => 'Comprehensive Eye & Vision Exam', 'name_ar' => 'فحص شامل للعين والنظر'],
                    ['name' => 'OCT Retinal Imaging', 'name_ar' => 'تصوير الشبكية OCT'],
                    ['name' => 'Retinal Laser & Injections', 'name_ar' => 'علاج الشبكية بالليزر والحقن'],
                    ['name' => 'Eyelid Surgery', 'name_ar' => 'جراحات الأجفان'],
                ],
            ],
            [
                'name' => 'Dr. Anwar Alesawi',
                'name_ar' => 'د. أنور العيساوي',
                'job' => 'Consultant Urologist',
                'job_ar' => 'استشاري جراحة المسالك البولية',
                'department' => 'Urology',
                'nationality' => 'Saudi',
                'qualifications' => [
                    ['name' => 'Consultant Urology/Andrology & Uro-Oncology', 'name_ar' => 'استشاري جراحة كلى ومسالك بولية وعقم وذكورة'],
                    ['name' => '16 Years Experience', 'name_ar' => 'خبرة ١٦ عاماً'],
                ],
                'services' => [
                    ['name' => 'Stone Treatment', 'name_ar' => 'علاج حصوات المسالك البولية'],
                    ['name' => 'Endourology & Laser Therapy', 'name_ar' => 'مناظير المسالك والليزر'],
                    ['name' => 'Andrology & Infertility', 'name_ar' => 'العقم والذكورة'],
                    ['name' => 'Urological Cancer Treatment', 'name_ar' => 'أورام المسالك البولية'],
                ],
            ],
            [
                'name' => 'Dr. Ahmad AbdAllah',
                'name_ar' => 'د. أحمد عبد الله',
                'job' => 'Urology Specialist',
                'job_ar' => 'أخصائي المسالك البولية',
                'department' => 'Urology',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'Urology Consultant', 'name_ar' => 'استشاري المسالك البولية'],
                ],
                'services' => [
                    ['name' => 'Urinary Stones', 'name_ar' => 'حصوات المسالك البولية'],
                    ['name' => 'Prostate Care', 'name_ar' => 'أمراض البروستاتا'],
                    ['name' => 'Urinary Tract Infections', 'name_ar' => 'التهابات المسالك البولية'],
                    ['name' => 'Endoscopy & Laser', 'name_ar' => 'المناظير والليزر'],
                ],
            ],
            [
                'name' => 'Dr. Aboalez Salah Taha Mohammed',
                'name_ar' => 'د. أبوالعز صلاح طه محمد',
                'job' => 'General Dentist',
                'job_ar' => 'طبيب أسنان عام',
                'department' => 'Dental',
                'nationality' => 'Sudanese',
                'qualifications' => [
                    ['name' => 'Bachelor of Dental Surgery', 'name_ar' => 'بكالوريوس طب وجراحة الفم والأسنان'],
                    ['name' => '10 Years Experience', 'name_ar' => 'خبرة ١٠ سنوات'],
                ],
                'services' => [
                    ['name' => 'Diagnostic Dentistry', 'name_ar' => 'تشخيص ووضع الخطط العلاجية'],
                    ['name' => 'Restorative Dentistry', 'name_ar' => 'معالجة وترميم الأسنان'],
                    ['name' => 'Periodontics', 'name_ar' => 'علاج أمراض اللثة'],
                    ['name' => 'Extractions', 'name_ar' => 'خلع الأسنان'],
                ],
            ],
            [
                'name' => 'Dr. Mohamed Godah Abdelrasheed',
                'name_ar' => 'د. محمد جوده عبد الرشيد',
                'job' => 'Restorative Dentistry Specialist',
                'job_ar' => 'أخصائي العلاج التحفظي للأسنان',
                'department' => 'Dental',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'Bachelor of Dental Medicine — Al-Azhar University (1998)', 'name_ar' => 'بكالوريوس طب الأسنان — جامعة الأزهر ١٩٩٨'],
                    ['name' => 'Diploma in Endodontics — Cairo University (2007)', 'name_ar' => 'دبلوم علاج جذور الأسنان — جامعة القاهرة ٢٠٠٧'],
                    ['name' => 'Diploma in Fixed Prosthodontics — Cairo University (2011)', 'name_ar' => 'دبلوم التركيبات الثابتة — جامعة القاهرة ٢٠١١'],
                    ['name' => '20+ Years Experience', 'name_ar' => 'خبرة تفوق ٢٠ عاماً'],
                ],
                'services' => [
                    ['name' => 'Root Canal Treatment', 'name_ar' => 'علاج جذور الأسنان'],
                    ['name' => 'Post & Core Restorations', 'name_ar' => 'دعامات الأسنان'],
                    ['name' => 'Zirconia & E-max Crowns', 'name_ar' => 'تلبيسات الزيركون والإيماكس'],
                    ['name' => 'Dental Bridges', 'name_ar' => 'جسور الأسنان'],
                    ['name' => 'Composite Restoration', 'name_ar' => 'الحشوات التجميلية'],
                ],
            ],
            [
                'name' => 'Dr. Hashim Taher Bin Baqer Al-Salman',
                'name_ar' => 'د. هاشم طاهر بن باقر السلمان',
                'job' => 'Neurosurgery Consultant',
                'job_ar' => 'استشاري جراحة المخ والأعصاب',
                'department' => 'Neuroscience',
                'nationality' => null,
                'qualifications' => [
                    ['name' => 'Doctorate in Neurosurgery', 'name_ar' => 'دكتوراه جراحة الأعصاب'],
                    ['name' => '20+ Years Experience', 'name_ar' => 'خبرة أكثر من ٢٠ عاماً'],
                ],
                'services' => [
                    ['name' => 'Stroke Care', 'name_ar' => 'جلطات ونزيف المخ'],
                    ['name' => 'Headache & Migraine', 'name_ar' => 'الصداع الحاد والمزمن'],
                    ['name' => 'Epilepsy', 'name_ar' => 'الصرع'],
                    ['name' => 'Multiple Sclerosis', 'name_ar' => 'التصلب المتعدد'],
                    ['name' => 'Memory & Dementia', 'name_ar' => 'الذاكرة والخرف'],
                    ['name' => 'Peripheral Neuropathy', 'name_ar' => 'التهاب الأعصاب الطرفية'],
                    ['name' => 'Movement Disorders', 'name_ar' => 'اضطرابات الحركة'],
                    ['name' => 'Botox for Migraine', 'name_ar' => 'حقن البوتوكس للصداع'],
                ],
            ],
            [
                'name' => 'Dr. Mohamed Abdalla Abdelazim',
                'name_ar' => 'د. محمد عبدالله عبد العظيم',
                'job' => 'Spine Surgery Specialist',
                'job_ar' => 'أخصائي جراحة العمود الفقري',
                'department' => 'Neuroscience',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'Doctorate in Neurosurgery', 'name_ar' => 'دكتوراه جراحة الأعصاب'],
                    ['name' => '20+ Years Experience', 'name_ar' => 'خبرة أكثر من ٢٠ عاماً'],
                ],
                'services' => [
                    ['name' => 'Spine Surgery', 'name_ar' => 'جراحات العمود الفقري'],
                ],
            ],
            [
                'name' => 'Dr. Essam Abdelmonem Sheha',
                'name_ar' => 'د. عصام عبد المنعم شيحة',
                'job' => 'Senior Registrar in Neurology',
                'job_ar' => 'نائب أول في طب المخ والأعصاب',
                'department' => 'Neuroscience',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'Egyptian Board of Neurology', 'name_ar' => 'البورد المصري في طب الأعصاب'],
                    ['name' => '20+ Years Experience', 'name_ar' => 'خبرة أكثر من ٢٠ عاماً'],
                ],
                'services' => [
                    ['name' => 'Stroke Care', 'name_ar' => 'جلطات ونزيف المخ'],
                    ['name' => 'Headache & Migraine', 'name_ar' => 'الصداع الحاد والمزمن'],
                    ['name' => 'Epilepsy', 'name_ar' => 'الصرع'],
                    ['name' => 'Multiple Sclerosis', 'name_ar' => 'التصلب المتعدد'],
                    ['name' => 'Memory & Dementia', 'name_ar' => 'الذاكرة والخرف'],
                    ['name' => 'Peripheral Neuropathy', 'name_ar' => 'التهاب الأعصاب الطرفية'],
                    ['name' => 'Movement Disorders', 'name_ar' => 'اضطرابات الحركة'],
                    ['name' => 'Botox for Migraine', 'name_ar' => 'حقن البوتوكس للصداع'],
                ],
            ],
            [
                'name' => 'Dr. Mahmoud Mostafa Ashour',
                'name_ar' => 'د. محمود مصطفى عاشور',
                'job' => 'Consultant of Rheumatology & Rehabilitation',
                'job_ar' => 'استشاري الروماتيزم والتأهيل',
                'department' => 'Rheumatology',
                'nationality' => 'Egyptian',
                'photo' => 'mahmoud-ashour.jpg',
                'qualifications' => [],
                'services' => [
                    ['name' => 'Rheumatoid Arthritis & Lupus', 'name_ar' => 'التهاب المفاصل الروماتويدي والذئبة الحمراء'],
                    ['name' => 'Osteoarthritis & Gout', 'name_ar' => 'خشونة المفاصل والنقرس'],
                    ['name' => 'Psoriatic Arthritis', 'name_ar' => 'التهاب المفاصل المصاحب للصدفية'],
                    ['name' => 'Back Pain & Spondylosis', 'name_ar' => 'آلام وخشونة العمود الفقري'],
                    ['name' => 'Osteoporosis', 'name_ar' => 'هشاشة العظام'],
                    ['name' => 'Joint & Soft Tissue Injections', 'name_ar' => 'الحقن الموضعي للمفاصل والأوتار'],
                    ['name' => 'Biologic Therapy', 'name_ar' => 'العلاج البيولوجي'],
                    ['name' => 'Rehabilitation & Physiotherapy', 'name_ar' => 'التأهيل الطبي والعلاج الطبيعي'],
                ],
            ],
            [
                'name' => 'Dr. Rasha Bilal',
                'name_ar' => 'د. رشا بلال',
                'job' => 'Rheumatology Specialist',
                'job_ar' => 'أخصائية روماتيزم',
                'department' => 'Rheumatology',
                'nationality' => 'Syrian',
                'qualifications' => [
                    ['name' => 'Master\'s in Rheumatology, Damascus University', 'name_ar' => 'ماجستير أمراض المفاصل والروماتيزم، جامعة دمشق'],
                    ['name' => 'Syrian Board in Rheumatology', 'name_ar' => 'البورد السوري في أمراض الروماتيزم'],
                    ['name' => 'EULAR-Endorsed Musculoskeletal Ultrasound Courses', 'name_ar' => 'دورات الموجات فوق الصوتية المعتمدة من EULAR'],
                    ['name' => '14 Years Experience', 'name_ar' => 'خبرة ١٤ عاماً'],
                ],
                'services' => [
                    ['name' => 'Rheumatoid Arthritis & Lupus', 'name_ar' => 'التهاب المفاصل الروماتيدي والذئبة'],
                    ['name' => 'Ankylosing Spondylitis', 'name_ar' => 'التهاب الفقار اللاصق'],
                    ['name' => 'Psoriatic Arthritis', 'name_ar' => 'التهاب المفاصل الصدفي'],
                    ['name' => 'Gout & Osteoporosis', 'name_ar' => 'النقرس وهشاشة العظام'],
                    ['name' => 'Biologic Therapies for Autoimmune Diseases', 'name_ar' => 'العلاجات البيولوجية لأمراض المناعة الذاتية'],
                    ['name' => 'Joint & Soft Tissue Injections', 'name_ar' => 'الحقن الموضعي للمفاصل والأوتار'],
                    ['name' => 'Musculoskeletal Ultrasound', 'name_ar' => 'السونار للعضلات والمفاصل'],
                ],
            ],
            [
                'name' => 'Dr. Asmaa Manzoor Uddin Sheikh',
                'name_ar' => 'د. أسماء منظور الدين شيخ',
                'job' => 'Senior Registrar in Psychiatry',
                'job_ar' => 'نائبة أولى في الطب النفسي',
                'department' => 'Psychiatry',
                'nationality' => 'Indian',
                'nationality_ar' => 'الهند',
                'nationality_flag' => '/flags/in.svg',
                'photo' => 'asmaa-manzoor.jpg',
                'qualifications' => [
                    ['name' => 'Bachelor of Medicine and Surgery (MBBS)', 'name_ar' => 'بكالوريوس الطب والجراحة'],
                    ['name' => 'MD (Psychiatry)', 'name_ar' => 'دكتوراه في الطب النفسي'],
                    ['name' => 'Professional Diploma in Geriatric Medicine, Royal College of Physicians of Ireland', 'name_ar' => 'دبلوم مهني في طب الشيخوخة من الكلية الملكية للأطباء في أيرلندا'],
                    ['name' => 'Winner of the “Innovative Leadership Award in Mental Health”, Golden Aim Awards for Excellence and Leadership in Healthcare (2020)', 'name_ar' => 'الفائزة بجائزة «القيادة المبتكرة في مجال الصحة العقلية» من جوائز الهدف الذهبي للتميز والقيادة في الرعاية الصحية ٢٠٢٠'],
                ],
                'services' => [
                    ['name' => 'Depression, Anxiety & Sleep Disorders', 'name_ar' => 'الاكتئاب والقلق واضطرابات النوم'],
                    ['name' => 'OCD, Phobias & PTSD', 'name_ar' => 'الوسواس القهري والرهاب واضطراب ما بعد الصدمة'],
                    ['name' => 'Stress & Adjustment Disorders, Anger Management', 'name_ar' => 'اضطرابات التوتر والتكيّف وإدارة الغضب'],
                    ['name' => 'Marital and Relationship Problems', 'name_ar' => 'المشاكل الزوجية والعلاقات'],
                    ['name' => 'Bipolar Disorder and Psychotic Illnesses', 'name_ar' => 'اضطراب ثنائي القطب والأمراض الذهانية'],
                    ['name' => 'Women\'s Mental Health', 'name_ar' => 'الصحة النفسية للمرأة'],
                    ['name' => 'Premenstrual, Menopausal & Postpartum Anxiety and Depression', 'name_ar' => 'القلق والاكتئاب قبل الحيض وعند انقطاع الطمث وبعد الولادة'],
                ],
            ],
            [
                'name' => 'Dr. Aza Abdelrahman Ahmed Fadl',
                'name_ar' => 'د. عزة عبدالرحمن أحمد فضل',
                'job' => 'Family Medicine Specialist',
                'job_ar' => 'أخصائية طب الأسرة',
                'department' => 'General Practice',
                'nationality' => 'Sudanese',
                'qualifications' => [
                    ['name' => 'MBBS', 'name_ar' => 'بكالوريوس الطب والجراحة'],
                    ['name' => 'Master\'s in Family Medicine', 'name_ar' => 'ماجستير طب الأسرة'],
                    ['name' => 'MRCGP Part 1', 'name_ar' => 'MRCGP الجزء الأول'],
                    ['name' => '10 Years Experience (5 in KSA)', 'name_ar' => 'خبرة ١٠ سنوات (٥ في السعودية)'],
                ],
                'services' => [
                    ['name' => 'Acute & Chronic Disease Management', 'name_ar' => 'تشخيص وعلاج الأمراض الحادة والمزمنة'],
                    ['name' => 'Diabetes & Hypertension Follow-up', 'name_ar' => 'متابعة السكري وضغط الدم'],
                    ['name' => 'Preventive Health Care', 'name_ar' => 'الرعاية الصحية الوقائية'],
                    ['name' => 'Adult & Child Health Care', 'name_ar' => 'رعاية البالغين والأطفال'],
                    ['name' => 'Vaccination & Immunization', 'name_ar' => 'التطعيمات والتحصينات'],
                    ['name' => 'Health Screening & Counseling', 'name_ar' => 'الفحوصات الدورية والتثقيف الصحي'],
                ],
            ],
            [
                'name' => 'Dr. Lamis Abdelaziz Mohamed Ali',
                'name_ar' => 'د. لاميس عبد العزيز محمد علي',
                'job' => 'General Practitioner',
                'job_ar' => 'طبيب عام',
                'department' => 'General Practice',
                'nationality' => 'Egyptian',
                'qualifications' => [
                    ['name' => 'Bachelor of Medicine & Surgery', 'name_ar' => 'بكالوريوس الطب والجراحة'],
                    ['name' => '12 Years Experience', 'name_ar' => 'خبرة ١٢ عاماً'],
                ],
                'services' => [
                    ['name' => 'General Practice', 'name_ar' => 'الطب العام'],
                    ['name' => 'Employee Health Clinic (EHC)', 'name_ar' => 'عيادة صحة الموظفين'],
                ],
            ],
            [
                'name' => 'Dr. Abid Hussain Afridi',
                'name_ar' => 'د. عابد حسين أفريدي',
                'job' => 'General Practitioner',
                'job_ar' => 'طبيب عام',
                'department' => 'General Practice',
                'nationality' => 'Pakistani',
                'qualifications' => [
                    ['name' => 'General Practitioner (GP)', 'name_ar' => 'طبيب عام'],
                    ['name' => 'OSH State Medical Academy', 'name_ar' => 'أكاديمية أوش الطبية الحكومية'],
                ],
                'services' => [
                    ['name' => 'Physical Examinations', 'name_ar' => 'الفحوصات الطبية الشاملة'],
                    ['name' => 'Diagnosis & Prescribing Medication', 'name_ar' => 'تشخيص الأعراض ووصف الدواء'],
                    ['name' => 'Health Education & Medical Advice', 'name_ar' => 'تثقيف صحي ونصائح طبية'],
                    ['name' => 'Simple Surgical Operations', 'name_ar' => 'العمليات الجراحية البسيطة'],
                    ['name' => 'Chronic Conditions Care (Diabetes, Asthma)', 'name_ar' => 'متابعة الحالات المزمنة: السكري والربو'],
                ],
            ],
        ];

        foreach ($doctors as $index => $data) {
            $department = Department::where('name', $data['department'])->firstOrFail();
            $nationality = $data['nationality']
                ? Nationality::firstOrCreate(
                    ['name' => $data['nationality']],
                    ['name_ar' => $data['nationality_ar'] ?? $data['nationality'], 'flag' => $data['nationality_flag'] ?? null],
                )
                : null;

            $doctor = Doctor::updateOrCreate(
                ['name' => $data['name']],
                [
                    'department_id' => $department->id,
                    'nationality_id' => $nationality?->id,
                    'name_ar' => $data['name_ar'],
                    'job' => $data['job'],
                    'job_ar' => $data['job_ar'],
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ],
            );

            if (isset($data['photo']) && $doctor->image === null) {
                $doctor->update(['image' => $this->storePhoto($data['photo'])]);
            }

            $doctor->qualifications()->delete();
            $doctor->qualifications()->createMany($data['qualifications']);

            $doctor->services()->delete();
            $doctor->services()->createMany($data['services']);
        }

        // Superseded by Dr. Asmaa Manzoor Uddin Sheikh. Hidden rather than deleted,
        // so the appointment history pointing at the placeholder survives. Named
        // explicitly: doctors also arrive through the admin, and deactivating
        // everything missing from this list would switch those off.
        Doctor::where('name', 'Psychiatry Consultant')->update(['is_active' => false]);
    }

    /**
     * Copy a bundled photo onto the public disk, returning the stored path.
     */
    private function storePhoto(string $filename): ?string
    {
        $source = self::PHOTO_SOURCE.'/'.$filename;

        if (! is_file($source)) {
            $this->command?->warn("Doctor photo [{$filename}] not found, storing doctor without a photo.");

            return null;
        }

        $path = 'doctors/'.$filename;

        if (! Storage::disk('public')->exists($path)) {
            Storage::disk('public')->put($path, (string) file_get_contents($source));
        }

        return $path;
    }
}
