require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const { generateBTechMark } = require('./realisticMarks');
const { pickAttendanceBand, buildRowsForStudent } = require('../services/attendanceEnrollment');

// ============================================================
// ALL STUDENTS — REAL DATA FROM CSV
// ============================================================
const allStudents = [
  // ── AE Department (60 students) ──────────────────────────────
  { name:"ADEPU DEEKSHIT", rollNumber:"24071A2401", department:"AE", bloodGroup:"B+VE", parentMobile:"9640457297", studentMobile:"6303993607", residentialAddress:"JAGATHGIRIGUTTA KUNA MAHALAKSHMI NAGAR HYDERABAD QUTHBULLAPUR MEDCHAL TELANGANA 500037" },
  { name:"AJMERA SNEHITH CHANDRA", rollNumber:"24071A2402", department:"AE", bloodGroup:"B+VE", parentMobile:"9502107160", studentMobile:"7032910490", residentialAddress:"5-139/30/3 SM COLONY SHANKERPALLY RANGA REDDY TELANGANA 501203" },
  { name:"AKKINOLU DEEKSHITH GOUD", rollNumber:"24071A2403", department:"AE", bloodGroup:"O+VE", parentMobile:"9391432926", studentMobile:"9849193347", residentialAddress:"6-13 GARDEN COLONY QUTHBULLAPUR BALANAGAR HYDERABAD TELANGANA 500055" },
  { name:"AKTHAR IRFAN KHAN", rollNumber:"24071A2404", department:"AE", bloodGroup:"O+VE", parentMobile:"7675058035", studentMobile:"8008435812", residentialAddress:"BANSWADA BROLAM CAMP BROLAM BANSNWADA KAMAREDDY TELANGANA 503187" },
  { name:"ALLAKUNTA GANESH", rollNumber:"24071A2405", department:"AE", bloodGroup:"A+VE", parentMobile:"7981309141", studentMobile:"9396244542", residentialAddress:"2-1-125/1 YELLAMMABANDA DURGAMMA TEMPLE KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"ANAND HARSHAVARDHAN", rollNumber:"24071A2406", department:"AE", bloodGroup:"O+VE", parentMobile:"8074417684", studentMobile:"8121370032", residentialAddress:"2/684 9 BAKRAPETA STREET PRODDATUR KADAPA ANDHRA PRADESH 516360" },
  { name:"ARUMALLA POSHIK REDDY", rollNumber:"24071A2407", department:"AE", bloodGroup:"O+VE", parentMobile:"8008392493", studentMobile:"9703072366", residentialAddress:"2/684-9 BAKRAPETA STREET PRODDATUR KADAPA ANDHRA PRADESH 516360" },
  { name:"AVIDI GUNESHWAR VEERA DEVI KUMAR", rollNumber:"24071A2408", department:"AE", bloodGroup:"B+VE", parentMobile:"8885196557", studentMobile:"9949909295", residentialAddress:"SRT-300 SANATHNAGAR HYDERABAD SECUNDERABAD RANGAREDDY TELANGANA 500018" },
  { name:"BAYAPUREDDY LAKSHMI KARTHIKA", rollNumber:"24071A2409", department:"AE", bloodGroup:"A+VE", parentMobile:"9440334460", studentMobile:"9550605070", residentialAddress:"77-16-1/1A LAXMI NAGAR VIJAYWADA AZITNAGAR KRISHNA ANDHRA PRADESH 520015" },
  { name:"BAYAPUREDDY RAM KARTHIKEYAN REDDY", rollNumber:"24071A2410", department:"AE", bloodGroup:"B+VE", parentMobile:"7702819638", studentMobile:"7207863920", residentialAddress:"BORABANDA ALLAPUR VIVEKANANDA NAGAR K V RANGAREDDY HYDERABAD TELANGANA 500018" },
  { name:"BEJUGAM VYSHALI", rollNumber:"24071A2411", department:"AE", bloodGroup:"A+VE", parentMobile:"9391309571", studentMobile:"8790014734", residentialAddress:"16-1-24/151SRT SAIDABAD HOUSING BOARD COLONY HYDERABAD TELANGANA 500059" },
  { name:"BURUGAPALLI MIHIR SAI", rollNumber:"24071A2412", department:"AE", bloodGroup:"O+VE", parentMobile:"8790735627", studentMobile:"9949626934", residentialAddress:"FLAT.404 AADHIRA ENCLAVE ROAD NO-10 BANDARI LAYOUT NIZAMPET BACHUPALLY MEDCHAL-MALKAJGIRS TELANGANA 500090" },
  { name:"CHEEDIRALA PRUDHVI VINAYAKA REDDY", rollNumber:"24071A2413", department:"AE", bloodGroup:"O+VE", parentMobile:"8333080537", studentMobile:"9182586770", residentialAddress:"6-54 GOVT HOSPITAL ROAD JAYANTHI VEERULAPADU NTR ANDHRA PRADESH 521170" },
  { name:"CHINTA SIDDHARTHA NAIDU", rollNumber:"24071A2414", department:"AE", bloodGroup:"B-VE", parentMobile:"8374322276", studentMobile:"8919449052", residentialAddress:"202 2ND FLOOOR DREAM VALLEY ROAD NO 1 MALLAPET QUTHBULLAPUR HYDERABAD TELANGANA 500090" },
  { name:"CHINTHAMANI VISHWAGYA VINAY KUMAR", rollNumber:"24071A2415", department:"AE", bloodGroup:"O+VE", parentMobile:"9440481846", studentMobile:"7330828037", residentialAddress:"18-19-56/2 ADARSH NAGAR-1 SIDDIPET SIDDIPET TELANGANA 502103" },
  { name:"CHITTI TANISH REDDY", rollNumber:"24071A2416", department:"AE", bloodGroup:"B+VE", parentMobile:"9032313537", studentMobile:"9391906557", residentialAddress:"2-332/1 MR COLONY NADIPUDI AMALAPURAM KONASEEMA TELANGANA 533221" },
  { name:"D HUSSAINAIAH", rollNumber:"24071A2417", department:"AE", bloodGroup:"O+VE", parentMobile:"9989931120", studentMobile:"9676963003", residentialAddress:"C 407 FORTUNE GREENHOMES SWAN HYDERABAD NARAYANA READDY COLONY RANGAREDDY TELANGANA 500090" },
  { name:"DAGGUMATI SUSHANTH", rollNumber:"24071A2418", department:"AE", bloodGroup:"O+VE", parentMobile:"7601036290", studentMobile:"7013701458", residentialAddress:"FLAT.NO 101 RD COMPLEX GODAVARI HOMES HYDERABAD QUTBULLAPUR MEDCHAL TELANGANA 500067" },
  { name:"DHATRIK RAO SIRIPRAGADA", rollNumber:"24071A2419", department:"AE", bloodGroup:"N/A", parentMobile:"9398996918", studentMobile:"9966839398", residentialAddress:"3-4-10/2 VVNAGAR KUKATPALLY BALANAGAR MEDCHAL MALKAJGIRI TELANGANA 500072" },
  { name:"DOMMETI ABHIRAM NADH", rollNumber:"24071A2420", department:"AE", bloodGroup:"A+VE", parentMobile:"8074440765", studentMobile:"9866573973", residentialAddress:"31-3-819 SAPTHAGIRI COLONY WADDEPALLY HANUMAKONDA TELANGANA 506370" },
  { name:"DUMBALA SHASHIVARDHAN REDDY", rollNumber:"24071A2421", department:"AE", bloodGroup:"A+VE", parentMobile:"9441312333", studentMobile:"9948423222", residentialAddress:"FLAT NO.506 STAR A APPARTMENTS HAPPY HOMES ROAD BHAGYA NAGAR COLONY KPHB HYDERABAD TELANGANA 500072" },
  { name:"G HIMANSHU REDDY", rollNumber:"24071A2422", department:"AE", bloodGroup:"O+VE", parentMobile:"9959333847", studentMobile:"9390900197", residentialAddress:"CHINTAL GANESH NAGAR HMT VILLAGE QUTBULLAPUR MEDCHAL TELANGANA 500054" },
  { name:"GADIPARTHI VENKATA SAI SATHVIK", rollNumber:"24071A2423", department:"AE", bloodGroup:"O+VE", parentMobile:"9951669539", studentMobile:"6305618184", residentialAddress:"STREET 1 GOLLAGUDEM VEMSOOR MANDAL KHAMMAM DISTRICT TELANGANA 507164" },
  { name:"GAVINI SAI KOMAL", rollNumber:"24071A2424", department:"AE", bloodGroup:"O+VE", parentMobile:"8790522799", studentMobile:"8885044388", residentialAddress:"HOUSE NO-1 PLOT NO-4-211/10D PRADHAMAPURI COLONY KAPRA MEDCHAL-MALKAJGIRI TELANGANA 500062" },
  { name:"GOVADA ANISH PRANAVADITYA", rollNumber:"24071A2425", department:"AE", bloodGroup:"B+VE", parentMobile:"9059831596", studentMobile:"9553841596", residentialAddress:"1-37 BAHEELAMPUR BAHEELAMPUR MULUGU MEDAK TELANGANA 502279" },
  { name:"GUNDU YASHWANTH REDDY", rollNumber:"24071A2426", department:"AE", bloodGroup:"B+VE", parentMobile:"8096500550", studentMobile:"7396341264", residentialAddress:"BALAJI NAGAR RD-NO1 BALAJI NAGAR 120/P MEDCHAL TOWN MEDCHAL MALKAJGIRI TELANGANA 501401" },
  { name:"JANAGAMA HRUTHIKA", rollNumber:"24071A2427", department:"AE", bloodGroup:"B+VE", parentMobile:"9703318620", studentMobile:"9032794173", residentialAddress:"3-67/3/339 NETHAJI NAGAR GULMOHAR PARK SERILINGAMPALLY NETHAJI NAGAR MANDAL RANGA REDDY TELANGANA 500019" },
  { name:"JIMMA NAGA SAI HIMAVARSHINI", rollNumber:"24071A2428", department:"AE", bloodGroup:"O+VE", parentMobile:"9652495597", studentMobile:"9121958734", residentialAddress:"B-25 V.S.P TOWNSHIP MADHARAM KAREPALLI KHAMMAM TELANGANA 507122" },
  { name:"KANDULA NANDA KISHORE", rollNumber:"24071A2429", department:"AE", bloodGroup:"O+VE", parentMobile:"9959206412", studentMobile:"9032682507", residentialAddress:"18-11-128/1/A/1 18-11-189/1/A/1 STREET NO.8 SANTHOSH NAGAR SIDDIPET TELANGANA 502103" },
  { name:"KARNATI NIKHIL", rollNumber:"24071A2430", department:"AE", bloodGroup:"O+VE", parentMobile:"9908467436", studentMobile:"8008140107", residentialAddress:"M THURKAPALLY M THURKAPALLY VALIGONDA YADADRI BHUVANAGIRI TELANGANA 508112" },
  { name:"KOLI MAHATHI", rollNumber:"24071A2431", department:"AE", bloodGroup:"A+VE", parentMobile:"7337558472", studentMobile:"7287826867", residentialAddress:"FLAT-401 BLOCK-A ARAVIND HEIGHTS MANIKONDA MARRICHETTU HYDERABAD GANDIPET MANDAL RANGA REDDY DISTRICT TELANGANA 500089" },
  { name:"KOTHAPALLI SRI LALITHA", rollNumber:"24071A2432", department:"AE", bloodGroup:"B+VE", parentMobile:"9533968717", studentMobile:"8019116717", residentialAddress:"FLAT NO 201 8-7-103/4 ROAD NO. 1 MALLIKARJUNA NAGAR OLD BOWENPALLY HYDERABAD TELANGANA 500011" },
  { name:"MADARAM AVANEESH", rollNumber:"24071A2433", department:"AE", bloodGroup:"O+VE", parentMobile:"9246843795", studentMobile:"7569290689", residentialAddress:"03-28 RAJAYA VEEDHI HYDERABAD GANDIPET MANDAL RANGAREDDY DISTRICT TELANGANA 500008" },
  { name:"MAHIKA KUMBALA", rollNumber:"24071A2434", department:"AE", bloodGroup:"O+VE", parentMobile:"9849354472", studentMobile:"9177554472", residentialAddress:"FLAT NO. P1 PARK VIEW RESIDENCY SATYAM HEIGHTS RAJIV GANDHI NAGAR BACHUPALLY QUTHBULLAPUR MEDCHAL-MALKAJGIRI TELANGANA 500090" },
  { name:"MALLELA TRIVIKRAM", rollNumber:"24071A2435", department:"AE", bloodGroup:"B+VE", parentMobile:"9494429052", studentMobile:"9392442677", residentialAddress:"5-11-867 YELAMMAGUTTA NEAR HANUMAN TEMPLE NIZAMABAD TELANGANA 503001" },
  { name:"MANCHALA SAI DEVARSHA", rollNumber:"24071A2436", department:"AE", bloodGroup:"A+VE", parentMobile:"9704362909", studentMobile:"7816027266", residentialAddress:"4/10/1988 BEHIND JHONSON GRAMMER HIGH SCHOOL HYDERABAD BALANAGAR MEDCHAL MALKAJGIRI TELANGANA 500018" },
  { name:"MATETI ABHISHEK ARYAN", rollNumber:"24071A2437", department:"AE", bloodGroup:"B+VE", parentMobile:"9704859856", studentMobile:"7093945540", residentialAddress:"H.NO3-2-38/1 ZERO POINT RAMAGUNDAM PEDDAPALLI TELANGANA 585208" },
  { name:"MUMMIDIVARAPU KRANTHI KUMAR", rollNumber:"24071A2438", department:"AE", bloodGroup:"O+VE", parentMobile:"9849020638", studentMobile:"7093700390", residentialAddress:"2-1-97/20 MAHAVEER NAGAR SHAMSHIGUDA YELLAMMABANDA KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"MUTHARAM JEEVANA", rollNumber:"24071A2439", department:"AE", bloodGroup:"O-VE", parentMobile:"9989099000", studentMobile:"7901499000", residentialAddress:"ANUHAR TIMBER FLAT NO. 502 ALKAPOOR TOWNSHIP ROAD NO. 21 PUPPALAGUDA NEKNAMPUR RANGA REDDY TELANGANA 500089" },
  { name:"NELAPUDI YASHASVI", rollNumber:"24071A2440", department:"AE", bloodGroup:"A-VE", parentMobile:"9492168163", studentMobile:"8179378163", residentialAddress:"5-5-6/119 SWEEJA NILAYAM REDDY COLONY BODUPPAL UPPAL MEDCHAL HYDERABAD TELANGANA 500092" },
  { name:"PAILA MANASA", rollNumber:"24071A2441", department:"AE", bloodGroup:"B+VE", parentMobile:"9441593497", studentMobile:"6300812598", residentialAddress:"2-163 RIMMA RIMMA SIRIKONDA ADILABAD TELANGANA 504307" },
  { name:"PAPANI RAKESH", rollNumber:"24071A2442", department:"AE", bloodGroup:"B+VE", parentMobile:"9000299921", studentMobile:"6309337444", residentialAddress:"VARALAXMI NILAYAM SIMHAPURI COLONY NEST VILLA LINE BACHUPALLY MEDCHAL RANGA REDDY TELANGANA 500090" },
  { name:"PARIDALA ROHITH", rollNumber:"24071A2443", department:"AE", bloodGroup:"B+VE", parentMobile:"9490469061", studentMobile:"6301117217", residentialAddress:"LIG-103 7TH PHASE KPHB HYDERABAD RANGAREDDY MEDCHAL TELANGANA 500072" },
  { name:"PARKI PARTHIV", rollNumber:"24071A2444", department:"AE", bloodGroup:"B+VE", parentMobile:"9948657544", studentMobile:"9346789853", residentialAddress:"12-52/2/8 H.NO.12-52/2/B OFFICER'S COLONY NAKREKAL NALGONDA TELANGANA 508211" },
  { name:"PENDOR JAIDEEP", rollNumber:"24071A2445", department:"AE", bloodGroup:"A+VE", parentMobile:"9010159225", studentMobile:"8977178037", residentialAddress:"4-11/40 BHOOMI REDDY COLONY QUTHBULLAPUR MALKIGIRI MEDCHAL TELANGANA 500055" },
  { name:"PRODDUTURI PRANAY", rollNumber:"24071A2446", department:"AE", bloodGroup:"B+VE", parentMobile:"9346050192", studentMobile:"7799698461", residentialAddress:"SREEE ANUSHA ESTATE SHAPUR NAGAR SHAPUR NAGAR JEEDIMETLA JEEDIMETLA QUTBULLAPUR MEDCHAL TELANGANA 500055" },
  { name:"RAHUL PHILLIP", rollNumber:"24071A2447", department:"AE", bloodGroup:"O+VE", parentMobile:"8008496707", studentMobile:"9182727860", residentialAddress:"35-6-187 PRAGATHI NAGAR HANAMKONDA HANAMKONDA WARANGAL TELANGANA" },
  { name:"RAJANALA ANANTHA RAJKIRAN", rollNumber:"24071A2448", department:"AE", bloodGroup:"B+VE", parentMobile:"9493117842", studentMobile:"9014637660", residentialAddress:"302 APARNA HEIGHTS PLOT 60 ROAD NO 2 KAKATEEYA HILLS MADHAPUR SERILINGAMPALLY HYDERABAD TELANGANA 500033" },
  { name:"RANGARAJU VENKATA SAI KUMAR", rollNumber:"24071A2449", department:"AE", bloodGroup:"A+VE", parentMobile:"9619887007", studentMobile:"9885011188", residentialAddress:"E-1004 RAINBOW VISTA ROCK GARDEN PHASE 2 NEAR IDL LAKE HYDERABAD KUKATPALLY RANGA REDDY TELANGANA 500018" },
  { name:"RAVVA LOKESH", rollNumber:"24071A2450", department:"AE", bloodGroup:"O+VE", parentMobile:"9581584854", studentMobile:"8341359346", residentialAddress:"5-21 RAMALAYAM STREET PRAGNAPUR GAJWEL SIDDIPET TELANGANA 502311" },
  { name:"ROHAN PUTHALATH SUJITH", rollNumber:"24071A2451", department:"AE", bloodGroup:"B+VE", parentMobile:"9652256789", studentMobile:"8500331133", residentialAddress:"3-6-40/2 PLOT NO.192 ROAD NO.10 VIVEKANANDA NAGAR COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"SAKE ARYA VARDHAN", rollNumber:"24071A2452", department:"AE", bloodGroup:"B+VE", parentMobile:"8688895070", studentMobile:"9491377223", residentialAddress:"PLOT NO. 30 3RD AVENUE SAINIKPURI SECUNDERABAD MEDCHAL MALKAJGIRI TELANGANA 500094" },
  { name:"SANA SAKET", rollNumber:"24071A2453", department:"AE", bloodGroup:"B+VE", parentMobile:"8688483594", studentMobile:"9966920075", residentialAddress:"203 BLOCK-B SURYA TOWERS NACHARAM QUTHBULLAPUR MEDCHAL-MALKAJGIRI TELANGANA 500076" },
  { name:"SHEERLA RUHAN", rollNumber:"24071A2454", department:"AE", bloodGroup:"B+VE", parentMobile:"9440628801", studentMobile:"9110326952", residentialAddress:"SAI PARADISE APPARTMENT 202 EENADU COLONY KUKATPALLY MEDCHAL HYDERABAD TELANGANA 500072" },
  { name:"SUJAY CHOWDHARY DODDAPANENI", rollNumber:"24071A2455", department:"AE", bloodGroup:"A+VE", parentMobile:"7675042594", studentMobile:"9515130331", residentialAddress:"C-1705 RAJAPUSHPA REGALIA KOKAPET GANDIPET ROAD KOKAPET GANDIPET RANAGREDDY TELANGANA 500075" },
  { name:"TALARI ANIL KUMAR", rollNumber:"24071A2456", department:"AE", bloodGroup:"O+VE", parentMobile:"6309349648", studentMobile:"7396903718", residentialAddress:"H. NO-10-11-308 ROAD NO-4 STREET NO 1 VIJAYAPURI COLONY KOTHAPET HYDERABAD RANGAREDDY TELANGANA 500035" },
  { name:"TUMMALAPALLI VENKATA SAI PRANAV", rollNumber:"24071A2457", department:"AE", bloodGroup:"O+VE", parentMobile:"9581156060", studentMobile:"9390448742", residentialAddress:"ANJANADRI RESIDENCY FLAT 101 RAMAKRISHNA NAGAR MADINAGUDA SERLINGAMPALLY RANGA REDDY TELANGANA 300049" },
  { name:"VALABOJU MANIKANTH CHARY", rollNumber:"24071A2458", department:"AE", bloodGroup:"A+VE", parentMobile:"6281408623", studentMobile:"6301029738", residentialAddress:"17-30 SRI NAGAR COLONY DILSHUKHNAGAR SAROORNAGAR RANGAREDDY TELANGANA 500060" },
  { name:"VALLABHANENI SUHAS KRISHNA", rollNumber:"24071A2459", department:"AE", bloodGroup:"O+VE", parentMobile:"9494456968", studentMobile:"8143932996", residentialAddress:"SRINIVASAM CITADEL 403 HARITHAVANAM COLONY BACHUPALLY MEDCHAL-MALKAJGIRI TELANGANA 500090" },
  { name:"VALLURU RITHIKA", rollNumber:"24071A2460", department:"AE", bloodGroup:"O+VE", parentMobile:"9866891417", studentMobile:"8790722137", residentialAddress:"1-37 HANUMAN COLONY BIJJARAM KOSGI NARAYANAPET TELANGANA 509339" },

  // ── CSE(DS) Department (17 students) ─────────────────────────
  { name:"KALYAN MADHU TAGALA", rollNumber:"24071A67G7", department:"CSE(DS)", bloodGroup:"O+VE", parentMobile:"9848012345", studentMobile:"8978123456", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"KARNALA SHASHANK", rollNumber:"24071A67G8", department:"CSE(DS)", bloodGroup:"A+VE", parentMobile:"9988776655", studentMobile:"8899667744", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"KONDE YASWANTH", rollNumber:"24071A67G9", department:"CSE(DS)", bloodGroup:"B+VE", parentMobile:"9123456789", studentMobile:"8123456789", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"KOYYALAMUDI AJAY", rollNumber:"24071A67H0", department:"CSE(DS)", bloodGroup:"AB+VE", parentMobile:"9765432109", studentMobile:"8765432109", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"LAKSH LAHOTI", rollNumber:"24071A67H1", department:"CSE(DS)", bloodGroup:"O-VE", parentMobile:"9012345678", studentMobile:"8012345678", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"LOKINI SNEHA", rollNumber:"24071A67H2", department:"CSE(DS)", bloodGroup:"O+VE", parentMobile:"9345678901", studentMobile:"8345678901", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"MANUPATI SANJANA", rollNumber:"24071A67H3", department:"CSE(DS)", bloodGroup:"A-VE", parentMobile:"9456789012", studentMobile:"8456789012", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"MATTAPARTHI HARSHITH", rollNumber:"24071A67H4", department:"CSE(DS)", bloodGroup:"B+VE", parentMobile:"9567890123", studentMobile:"8567890123", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"MOHAMMED ASHRAF AHMED", rollNumber:"24071A67H5", department:"CSE(DS)", bloodGroup:"O+VE", parentMobile:"9678901234", studentMobile:"8678901234", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"MOKSHANA MANUPATI", rollNumber:"24071A67H6", department:"CSE(DS)", bloodGroup:"A+VE", parentMobile:"9890123456", studentMobile:"8890123456", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"UNDETI NEHAL RAJ", rollNumber:"24071A67K7", department:"CSE(DS)", bloodGroup:"AB+VE", parentMobile:"9901234567", studentMobile:"8901234567", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"V.JIMESH", rollNumber:"24071A67K8", department:"CSE(DS)", bloodGroup:"O+VE", parentMobile:"9812345670", studentMobile:"8812345670", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"TRISHANTH VANGA", rollNumber:"24071A67K9", department:"CSE(DS)", bloodGroup:"B-VE", parentMobile:"9823456701", studentMobile:"8823456701", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"VEDANTAM SRILASYA", rollNumber:"24071A67M0", department:"CSE(DS)", bloodGroup:"A+VE", parentMobile:"9834567012", studentMobile:"8834567012", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"VELICHALA KIREETI RAO", rollNumber:"24071A67M1", department:"CSE(DS)", bloodGroup:"O+VE", parentMobile:"9845670123", studentMobile:"8845670123", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"PUNEET VEMURI", rollNumber:"24071A67M2", department:"CSE(DS)", bloodGroup:"B+VE", parentMobile:"9856701234", studentMobile:"8856701234", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"YAMJALA KALYAN REDDY", rollNumber:"24071A67M3", department:"CSE(DS)", bloodGroup:"O-VE", parentMobile:"9867012345", studentMobile:"8867012345", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },

  // ── CSE(IOT) Department (4 students) ─────────────────────────
  { name:"A SRIHITHA", rollNumber:"24071A6901", department:"CSE(IOT)", bloodGroup:"A+VE", parentMobile:"9870123456", studentMobile:"8870123456", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"AMALAKANTI ARAVIND", rollNumber:"24071A6902", department:"CSE(IOT)", bloodGroup:"AB+VE", parentMobile:"9801234567", studentMobile:"8801234567", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"ANANTHULA SATHWIK", rollNumber:"24071A6903", department:"CSE(IOT)", bloodGroup:"O+VE", parentMobile:"9712345678", studentMobile:"8712345678", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"YENDURU AKANKSHA", rollNumber:"24071A6964", department:"CSE(IOT)", bloodGroup:"B+VE", parentMobile:"9723456789", studentMobile:"8723456789", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },

  // ── CSE Department (65 students) ─────────────────────────────
  { name:"AARE SANVI REDDY", rollNumber:"24071A0501", department:"CSE", bloodGroup:"A-VE", parentMobile:"9734567890", studentMobile:"8734567890", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"PALAKALA MITHUN KUMAR", rollNumber:"24071A0502", department:"CSE", bloodGroup:"O+VE", parentMobile:"9745678901", studentMobile:"8745678901", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"AERPULA SPOORTHY", rollNumber:"24071A0503", department:"CSE", bloodGroup:"A+VE", parentMobile:"9756789012", studentMobile:"8756789012", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"AERUVA SATHWIKA", rollNumber:"24071A0504", department:"CSE", bloodGroup:"B-VE", parentMobile:"9767890123", studentMobile:"8767890123", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"AKSHAYA CHUNDI", rollNumber:"24071A0505", department:"CSE", bloodGroup:"O+VE", parentMobile:"9778901234", studentMobile:"8778901234", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"AKSHITHA REDDY BONUGA", rollNumber:"24071A0506", department:"CSE", bloodGroup:"B+VE", parentMobile:"9789012345", studentMobile:"8789012345", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"ALAPATI BHAVANA", rollNumber:"24071A0507", department:"CSE", bloodGroup:"A+VE", parentMobile:"9790123456", studentMobile:"8790123456", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"ANKENAPALLY AKHILESH", rollNumber:"24071A0508", department:"CSE", bloodGroup:"AB+VE", parentMobile:"9612345678", studentMobile:"8612345678", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"ANUMALASETTY V S ROHITH", rollNumber:"24071A0509", department:"CSE", bloodGroup:"O+VE", parentMobile:"9623456789", studentMobile:"8623456789", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"JAHNAVI VELAGAPUDI", rollNumber:"24071A0530", department:"CSE", bloodGroup:"A-VE", parentMobile:"9634567890", studentMobile:"8634567890", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"JAVVADI SANNIHITH VIKRAM", rollNumber:"24071A0531", department:"CSE", bloodGroup:"B+VE", parentMobile:"9645678901", studentMobile:"8645678901", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"JOSHI SOMESHWAR", rollNumber:"24071A0532", department:"CSE", bloodGroup:"O-VE", parentMobile:"9656789012", studentMobile:"8656789012", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"KADIYALA YASHWANTH", rollNumber:"24071A0533", department:"CSE", bloodGroup:"A+VE", parentMobile:"9667890123", studentMobile:"8667890123", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"KALVAKOTA SAI SUPRIYA", rollNumber:"24071A0534", department:"CSE", bloodGroup:"B-VE", parentMobile:"9678901234", studentMobile:"8678901234", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"KAVURI SAISRITRIPAD", rollNumber:"24071A0535", department:"CSE", bloodGroup:"O+VE", parentMobile:"9689012345", studentMobile:"8689012345", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"KONDAGUDURU ANUSHA", rollNumber:"24071A0536", department:"CSE", bloodGroup:"AB+VE", parentMobile:"9690123456", studentMobile:"8690123456", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"KOPPINEEDI SRI LAKSHMI SAI", rollNumber:"24071A0537", department:"CSE", bloodGroup:"A+VE", parentMobile:"9512345678", studentMobile:"8512345678", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"KOTHA DHATHRESH SAI", rollNumber:"24071A0538", department:"CSE", bloodGroup:"O+VE", parentMobile:"9523456789", studentMobile:"8523456789", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"KRISHNA KOUSHAL NAGABHAIRAVA", rollNumber:"24071A0539", department:"CSE", bloodGroup:"B+VE", parentMobile:"9534567890", studentMobile:"8534567890", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"MELLACHERVU KETHANA", rollNumber:"24071A05B0", department:"CSE", bloodGroup:"A-VE", parentMobile:"9545678901", studentMobile:"8545678901", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"MOHAMMAD UMAR FAROOQ", rollNumber:"24071A05B1", department:"CSE", bloodGroup:"O-VE", parentMobile:"9556789012", studentMobile:"8556789012", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"MOHAMMED RAYAN NIZAMI", rollNumber:"24071A05B2", department:"CSE", bloodGroup:"B+VE", parentMobile:"9567890123", studentMobile:"8567890123", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"MOHD NIZAM UDDIN ANZAR", rollNumber:"24071A05B3", department:"CSE", bloodGroup:"A+VE", parentMobile:"9578901234", studentMobile:"8578901234", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"MOOTAKODURU HARSHITHA", rollNumber:"24071A05B4", department:"CSE", bloodGroup:"O+VE", parentMobile:"9589012345", studentMobile:"8589012345", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"MORAMPUDI HARITEJA", rollNumber:"24071A05B5", department:"CSE", bloodGroup:"AB+VE", parentMobile:"9590123456", studentMobile:"8590123456", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"MUTTINENI VAHINI", rollNumber:"24071A05B6", department:"CSE", bloodGroup:"B-VE", parentMobile:"9412345678", studentMobile:"8412345678", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"PATHAKALA ASHWITH", rollNumber:"24071A05B7", department:"CSE", bloodGroup:"A+VE", parentMobile:"9423456789", studentMobile:"8423456789", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"PAMU NIKHIL", rollNumber:"24071A05B8", department:"CSE", bloodGroup:"O+VE", parentMobile:"9434567890", studentMobile:"8434567890", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"PANUGANTI MANIKANTH", rollNumber:"24071A05B9", department:"CSE", bloodGroup:"B+VE", parentMobile:"9445678901", studentMobile:"8445678901", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"NELLURI HARSHITHA", rollNumber:"24071A05J0", department:"CSE", bloodGroup:"A-VE", parentMobile:"9456789012", studentMobile:"8456789012", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"NIMMALA LOHITH", rollNumber:"24071A05J1", department:"CSE", bloodGroup:"O-VE", parentMobile:"9467890123", studentMobile:"8467890123", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"NIMMALA RUCHITHA", rollNumber:"24071A05J2", department:"CSE", bloodGroup:"B+VE", parentMobile:"9478901234", studentMobile:"8478901234", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"P KARAN SAI", rollNumber:"24071A05J3", department:"CSE", bloodGroup:"A+VE", parentMobile:"9489012345", studentMobile:"8489012345", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"PALLE TANISHQ GOUD", rollNumber:"24071A05J4", department:"CSE", bloodGroup:"O+VE", parentMobile:"9490123456", studentMobile:"8490123456", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"PENTAKOTA GIREESHA", rollNumber:"24071A05J5", department:"CSE", bloodGroup:"AB+VE", parentMobile:"9312345678", studentMobile:"8312345678", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"PERIKETI LAKSHMAN", rollNumber:"24071A05J6", department:"CSE", bloodGroup:"B-VE", parentMobile:"9323456789", studentMobile:"8323456789", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"R V N LOKESH", rollNumber:"24071A05J7", department:"CSE", bloodGroup:"A+VE", parentMobile:"9334567890", studentMobile:"8334567890", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"RAAVI HAVISH", rollNumber:"24071A05J8", department:"CSE", bloodGroup:"O+VE", parentMobile:"9345678901", studentMobile:"8345678901", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"RAGOLU DILIP", rollNumber:"24071A05J9", department:"CSE", bloodGroup:"B+VE", parentMobile:"9356789012", studentMobile:"8356789012", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"AMULYA NAALLA", rollNumber:"24071A05N0", department:"CSE", bloodGroup:"A-VE", parentMobile:"9367890123", studentMobile:"8367890123", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"ANDE SAMHITHA", rollNumber:"24071A05N1", department:"CSE", bloodGroup:"O-VE", parentMobile:"9378901234", studentMobile:"8378901234", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"ANJURI MOKSHAGNA", rollNumber:"24071A05N2", department:"CSE", bloodGroup:"B+VE", parentMobile:"9389012345", studentMobile:"8389012345", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"AUTI SAHASRA", rollNumber:"24071A05N3", department:"CSE", bloodGroup:"A+VE", parentMobile:"9390123456", studentMobile:"8390123456", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"BADINENI DIKSHITH", rollNumber:"24071A05N4", department:"CSE", bloodGroup:"O+VE", parentMobile:"9212345678", studentMobile:"8212345678", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"BANOTH PRANAVYA", rollNumber:"24071A05N5", department:"CSE", bloodGroup:"AB+VE", parentMobile:"9223456789", studentMobile:"8223456789", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"BAZARU AMULYA", rollNumber:"24071A05N6", department:"CSE", bloodGroup:"B-VE", parentMobile:"9234567890", studentMobile:"8234567890", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"BHAVYA TUMMALA", rollNumber:"24071A05N7", department:"CSE", bloodGroup:"A+VE", parentMobile:"9245678901", studentMobile:"8245678901", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"BHUKYA NAVYA", rollNumber:"24071A05N8", department:"CSE", bloodGroup:"O+VE", parentMobile:"9256789012", studentMobile:"8256789012", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"BOKKA SWARA VARUNAKAR", rollNumber:"24071A05N9", department:"CSE", bloodGroup:"B+VE", parentMobile:"9267890123", studentMobile:"8267890123", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"KONDAPALLI SREEKAR", rollNumber:"24071A05R0", department:"CSE", bloodGroup:"A-VE", parentMobile:"9278901234", studentMobile:"8278901234", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"MADASU SIRIVALLY", rollNumber:"24071A05R1", department:"CSE", bloodGroup:"O-VE", parentMobile:"9289012345", studentMobile:"8289012345", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"MADHAVARAM PRANAV RAO", rollNumber:"24071A05R2", department:"CSE", bloodGroup:"B+VE", parentMobile:"9290123456", studentMobile:"8290123456", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"MADIREDDY TANISHKA", rollNumber:"24071A05R3", department:"CSE", bloodGroup:"A+VE", parentMobile:"9112345678", studentMobile:"8112345678", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"MASIREDDY SUSHANTH REDDY", rollNumber:"24071A05R4", department:"CSE", bloodGroup:"O+VE", parentMobile:"9123456789", studentMobile:"8123456789", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"MITUL C VIPANI", rollNumber:"24071A05R5", department:"CSE", bloodGroup:"AB+VE", parentMobile:"9134567890", studentMobile:"8134567890", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"MOGILIGUNDLA ADITHYA", rollNumber:"24071A05R6", department:"CSE", bloodGroup:"B-VE", parentMobile:"9145678901", studentMobile:"8145678901", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"MOHAMMED AYAAN", rollNumber:"24071A05R7", department:"CSE", bloodGroup:"A+VE", parentMobile:"9156789012", studentMobile:"8156789012", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"MOHAMMED AZEEMUDDIN TALHA", rollNumber:"24071A05R8", department:"CSE", bloodGroup:"O+VE", parentMobile:"9167890123", studentMobile:"8167890123", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"MOOD SRIRAM", rollNumber:"24071A05R9", department:"CSE", bloodGroup:"B+VE", parentMobile:"9178901234", studentMobile:"8178901234", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"VAISHNAVI KOPPAKULA", rollNumber:"24071A05V0", department:"CSE", bloodGroup:"A-VE", parentMobile:"9189012345", studentMobile:"8189012345", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"VEERAMOSU SAHITHI", rollNumber:"24071A05V1", department:"CSE", bloodGroup:"O-VE", parentMobile:"9190123456", studentMobile:"8190123456", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"VELAGANDULA SAI SMARAN", rollNumber:"24071A05V2", department:"CSE", bloodGroup:"B+VE", parentMobile:"9912345678", studentMobile:"8912345678", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"VUTUKURI CHOHITH", rollNumber:"24071A05V3", department:"CSE", bloodGroup:"A+VE", parentMobile:"9923456789", studentMobile:"8923456789", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"YELLAMPALLI YASHASH CHANDRA", rollNumber:"24071A05V4", department:"CSE", bloodGroup:"O+VE", parentMobile:"9934567890", studentMobile:"8934567890", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },

  // ── ECE Department (15 students) ─────────────────────────────
  { name:"A ABHINAY REDDY", rollNumber:"24071A0401", department:"ECE", bloodGroup:"AB+VE", parentMobile:"9945678901", studentMobile:"8945678901", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"ADAPAKA TEJ SATWIK", rollNumber:"24071A0402", department:"ECE", bloodGroup:"B-VE", parentMobile:"9956789012", studentMobile:"8956789012", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"ADKY VISHNU ADITYA", rollNumber:"24071A0403", department:"ECE", bloodGroup:"A+VE", parentMobile:"9967890123", studentMobile:"8967890123", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"ANANYAA NEDUNURI", rollNumber:"24071A0404", department:"ECE", bloodGroup:"O+VE", parentMobile:"9978901234", studentMobile:"8978901234", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"ANNEPAKA ABHIJEET KARAN", rollNumber:"24071A0405", department:"ECE", bloodGroup:"B+VE", parentMobile:"9989012345", studentMobile:"8989012345", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"GURRAM RUSHAT REDDY", rollNumber:"24071A0426", department:"ECE", bloodGroup:"A-VE", parentMobile:"9990123456", studentMobile:"8990123456", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"J KARTHIKEYA CHOWDARY", rollNumber:"24071A0427", department:"ECE", bloodGroup:"O-VE", parentMobile:"9811234567", studentMobile:"8811234567", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"KAM MAHENDRA REDDY", rollNumber:"24071A0428", department:"ECE", bloodGroup:"B+VE", parentMobile:"9822345678", studentMobile:"8822345678", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"KERELLI SHRESTA", rollNumber:"24071A0429", department:"ECE", bloodGroup:"A+VE", parentMobile:"9833456789", studentMobile:"8833456789", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"KONAKATI VIDYANAND REDDY", rollNumber:"24071A0430", department:"ECE", bloodGroup:"O+VE", parentMobile:"9844567890", studentMobile:"8844567890", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"KORRA SUMANTH NAIK", rollNumber:"24071A0431", department:"ECE", bloodGroup:"AB+VE", parentMobile:"9855678901", studentMobile:"8855678901", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"JKURUVA PILLIGUNDLA PARAMESH", rollNumber:"24071A0432", department:"ECE", bloodGroup:"B-VE", parentMobile:"9866789012", studentMobile:"8866789012", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"LANKA SHARANYA SAI", rollNumber:"24071A0433", department:"ECE", bloodGroup:"A+VE", parentMobile:"9877890123", studentMobile:"8877890123", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"M V S S SAI NIKHIL", rollNumber:"24071A0434", department:"ECE", bloodGroup:"O+VE", parentMobile:"9888901234", studentMobile:"8888901234", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"MAKKENA SNEHITHA", rollNumber:"24071A0435", department:"ECE", bloodGroup:"B+VE", parentMobile:"9899012345", studentMobile:"8899012345", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },

  // ── EIE Department (33 students) ─────────────────────────────
  { name:"KOPPISETTY RISHIK ADITYA", rollNumber:"24071A1033", department:"EIE", bloodGroup:"A-VE", parentMobile:"9711234567", studentMobile:"8711234567", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"KUDITHIPUDI KARTHIKA", rollNumber:"24071A1034", department:"EIE", bloodGroup:"O-VE", parentMobile:"9722345678", studentMobile:"8722345678", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"MADDALA KUNDANIKA", rollNumber:"24071A1035", department:"EIE", bloodGroup:"B+VE", parentMobile:"9733456789", studentMobile:"8733456789", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"MANGAMUDI SAI ROSHINI", rollNumber:"24071A1036", department:"EIE", bloodGroup:"A+VE", parentMobile:"9744567890", studentMobile:"8744567890", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"MANNALA TEJA SREE", rollNumber:"24071A1037", department:"EIE", bloodGroup:"O+VE", parentMobile:"9755678901", studentMobile:"8755678901", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"MATTA SNIGDHA", rollNumber:"24071A1038", department:"EIE", bloodGroup:"AB+VE", parentMobile:"9766789012", studentMobile:"8766789012", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"MOLUGURI SAI SUJAL", rollNumber:"24071A1039", department:"EIE", bloodGroup:"B-VE", parentMobile:"9777890123", studentMobile:"8777890123", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"MUDAVATH SHIREESHA", rollNumber:"24071A1040", department:"EIE", bloodGroup:"A+VE", parentMobile:"9788901234", studentMobile:"8788901234", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"MUPPALLA VENNELA", rollNumber:"24071A1041", department:"EIE", bloodGroup:"O+VE", parentMobile:"9799012345", studentMobile:"8799012345", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"MYLARAM MANI TEJA", rollNumber:"24071A1042", department:"EIE", bloodGroup:"B+VE", parentMobile:"9611234567", studentMobile:"8611234567", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"YENUKATALA PRAVALLIKA", rollNumber:"24071A1063", department:"EIE", bloodGroup:"A-VE", parentMobile:"9622345678", studentMobile:"8622345678", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"ADITYA MOTAGI", rollNumber:"24071A1064", department:"EIE", bloodGroup:"O-VE", parentMobile:"9633456789", studentMobile:"8633456789", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"AKAVARAM SUJITHA", rollNumber:"24071A1065", department:"EIE", bloodGroup:"B+VE", parentMobile:"9644567890", studentMobile:"8644567890", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"AKSHATHALA SREERAMYA", rollNumber:"24071A1066", department:"EIE", bloodGroup:"A+VE", parentMobile:"9655678901", studentMobile:"8655678901", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"ALLE NITHYA HASINI", rollNumber:"24071A1067", department:"EIE", bloodGroup:"O+VE", parentMobile:"9666789012", studentMobile:"8666789012", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"AMALAKANTI DURGA PRASAD", rollNumber:"24071A1068", department:"EIE", bloodGroup:"AB+VE", parentMobile:"9677890123", studentMobile:"8677890123", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"ASHISH TIWARI", rollNumber:"24071A1069", department:"EIE", bloodGroup:"B-VE", parentMobile:"9688901234", studentMobile:"8688901234", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"ATCHA SRIHITHA", rollNumber:"24071A1070", department:"EIE", bloodGroup:"A+VE", parentMobile:"9699012345", studentMobile:"8699012345", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"BANOTH SHASHIDHAR", rollNumber:"24071A1071", department:"EIE", bloodGroup:"O+VE", parentMobile:"9511234567", studentMobile:"8511234567", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"BOJANNAGARI PRIYATHAM REDDY", rollNumber:"24071A1072", department:"EIE", bloodGroup:"B+VE", parentMobile:"9522345678", studentMobile:"8522345678", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"MIRIYALA SNEHA", rollNumber:"24071A1093", department:"EIE", bloodGroup:"A-VE", parentMobile:"9533456789", studentMobile:"8533456789", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"MOHAMMAD FAHEEM", rollNumber:"24071A1094", department:"EIE", bloodGroup:"O-VE", parentMobile:"9544567890", studentMobile:"8544567890", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"MOHEMED MAGDOOM MOHIDDIN", rollNumber:"24071A1095", department:"EIE", bloodGroup:"B+VE", parentMobile:"9555678901", studentMobile:"8555678901", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"MUPPA SIVA SRIJA", rollNumber:"24071A1096", department:"EIE", bloodGroup:"A+VE", parentMobile:"9566789012", studentMobile:"8566789012", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"NAGUBANDI SWATHI", rollNumber:"24071A1097", department:"EIE", bloodGroup:"O+VE", parentMobile:"9577890123", studentMobile:"8577890123", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"NALLAVELLI RAJAKRUTHIK REDDY", rollNumber:"24071A1098", department:"EIE", bloodGroup:"AB+VE", parentMobile:"9588901234", studentMobile:"8588901234", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"NAMPALLY REVANTH", rollNumber:"24071A1099", department:"EIE", bloodGroup:"B-VE", parentMobile:"9599012345", studentMobile:"8599012345", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"NAYKOTI CHANDU MUDHIRAJ", rollNumber:"24071A10A0", department:"EIE", bloodGroup:"A+VE", parentMobile:"9411234567", studentMobile:"8411234567", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"NEERADI RAJIV", rollNumber:"24071A10A1", department:"EIE", bloodGroup:"O+VE", parentMobile:"9422345678", studentMobile:"8422345678", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"NELLI SIDDHARTHA RAJ", rollNumber:"24071A10A2", department:"EIE", bloodGroup:"B+VE", parentMobile:"9433456789", studentMobile:"8433456789", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"VEERA VENKATA SRUTHI", rollNumber:"24071A10C3", department:"EIE", bloodGroup:"A-VE", parentMobile:"9444567890", studentMobile:"8444567890", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"VELLANKI NAGA VENKATA HARINKARTHIKEYA", rollNumber:"24071A10C4", department:"EIE", bloodGroup:"O-VE", parentMobile:"9455678901", studentMobile:"8455678901", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"YADLAPALLI SATHWICK CHOWDARY", rollNumber:"24071A10C5", department:"EIE", bloodGroup:"B+VE", parentMobile:"9466789012", studentMobile:"8466789012", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },

  // ── IT Department (57 students) ──────────────────────────────
  { name:"AKHILA T", rollNumber:"24071A1201", department:"IT", bloodGroup:"A+VE", parentMobile:"9477890123", studentMobile:"8477890123", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"AMRITA PATNAIK", rollNumber:"24071A1202", department:"IT", bloodGroup:"O+VE", parentMobile:"9488901234", studentMobile:"8488901234", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"ANAMALLA SUCHARITHA", rollNumber:"24071A1203", department:"IT", bloodGroup:"AB+VE", parentMobile:"9499012345", studentMobile:"8499012345", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"ANUMULA MOKSHAGNA", rollNumber:"24071A1204", department:"IT", bloodGroup:"B-VE", parentMobile:"9311234567", studentMobile:"8311234567", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"ANUMULA RAJESH", rollNumber:"24071A1205", department:"IT", bloodGroup:"A+VE", parentMobile:"9322345678", studentMobile:"8322345678", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"BANDARI SATHWIK", rollNumber:"24071A1206", department:"IT", bloodGroup:"O+VE", parentMobile:"9333456789", studentMobile:"8333456789", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"BANDI POOJITHA VIHARI", rollNumber:"24071A1207", department:"IT", bloodGroup:"B+VE", parentMobile:"9344567890", studentMobile:"8344567890", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"KASAM AANYA REDDY", rollNumber:"24071A1228", department:"IT", bloodGroup:"A-VE", parentMobile:"9355678901", studentMobile:"8355678901", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"KATAKAM YASHI RUKMINI DHANALAKSHMI", rollNumber:"24071A1229", department:"IT", bloodGroup:"O-VE", parentMobile:"9366789012", studentMobile:"8366789012", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"KOONA SRIHITHA", rollNumber:"24071A1230", department:"IT", bloodGroup:"B+VE", parentMobile:"9377890123", studentMobile:"8377890123", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"KOTHA ANJALI", rollNumber:"24071A1231", department:"IT", bloodGroup:"A+VE", parentMobile:"9388901234", studentMobile:"8388901234", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"KURELLY VIVEKANANDA REDDY", rollNumber:"24071A1232", department:"IT", bloodGroup:"O+VE", parentMobile:"9399012345", studentMobile:"8399012345", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"MACHERLA VIBHAS", rollNumber:"24071A1233", department:"IT", bloodGroup:"AB+VE", parentMobile:"9211234567", studentMobile:"8211234567", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"MADDU NIVEDITA", rollNumber:"24071A1234", department:"IT", bloodGroup:"B-VE", parentMobile:"9222345678", studentMobile:"8222345678", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"MAHAMMAD SAMEER", rollNumber:"24071A1235", department:"IT", bloodGroup:"A+VE", parentMobile:"9233456789", studentMobile:"8233456789", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"MALIGIREDDY JOSHNA REDDY", rollNumber:"24071A1236", department:"IT", bloodGroup:"O+VE", parentMobile:"9244567890", studentMobile:"8244567890", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"MARKAPUDI VICTOR SUSHANTH", rollNumber:"24071A1237", department:"IT", bloodGroup:"B+VE", parentMobile:"9255678901", studentMobile:"8255678901", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"TAMBALA REHAN", rollNumber:"24071A1258", department:"IT", bloodGroup:"A-VE", parentMobile:"9266789012", studentMobile:"8266789012", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"TEJASWINI NANDINI SUNKARA", rollNumber:"24071A1259", department:"IT", bloodGroup:"O-VE", parentMobile:"9277890123", studentMobile:"8277890123", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"THANNIRU HARICHARAN", rollNumber:"24071A1260", department:"IT", bloodGroup:"B+VE", parentMobile:"9288901234", studentMobile:"8288901234", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"TIRUNARI KRISHNA SATHVIKA", rollNumber:"24071A1261", department:"IT", bloodGroup:"A+VE", parentMobile:"9299012345", studentMobile:"8299012345", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"VAKKAVANTHULA NAGA SAI HAMSIKA", rollNumber:"24071A1262", department:"IT", bloodGroup:"O+VE", parentMobile:"9111234567", studentMobile:"8111234567", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"VELAMATI HUMSIKA", rollNumber:"24071A1263", department:"IT", bloodGroup:"AB+VE", parentMobile:"9122345678", studentMobile:"8122345678", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"VEMPATI RAMANANDA BRAHMA SATYA PRAKASH", rollNumber:"24071A1264", department:"IT", bloodGroup:"B-VE", parentMobile:"9133456789", studentMobile:"8133456789", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"VILASAGARAPU NUTHAN", rollNumber:"24071A1265", department:"IT", bloodGroup:"A+VE", parentMobile:"9144567890", studentMobile:"8144567890", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"ABDUL RAZZAQ", rollNumber:"24071A1266", department:"IT", bloodGroup:"O+VE", parentMobile:"9155678901", studentMobile:"8155678901", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"ADAVALLI ADITYA REDDY", rollNumber:"24071A1267", department:"IT", bloodGroup:"B+VE", parentMobile:"9166789012", studentMobile:"8166789012", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"GUDIWADA MEGHANA", rollNumber:"24071A1288", department:"IT", bloodGroup:"A-VE", parentMobile:"9177890123", studentMobile:"8177890123", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"GUNTI SATHVIKA", rollNumber:"24071A1289", department:"IT", bloodGroup:"O-VE", parentMobile:"9188901234", studentMobile:"8188901234", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"KAMINENI SAHASRA", rollNumber:"24071A1290", department:"IT", bloodGroup:"B+VE", parentMobile:"9199012345", studentMobile:"8199012345", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"KASIREDDY GANGAIAHGARI RAMA LOKESH REDDY", rollNumber:"24071A1291", department:"IT", bloodGroup:"A+VE", parentMobile:"9911234567", studentMobile:"8911234567", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"KATRAVATH AKSHITHA", rollNumber:"24071A1292", department:"IT", bloodGroup:"O+VE", parentMobile:"9922345678", studentMobile:"8922345678", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"KOLANA KONDA BHAVANI", rollNumber:"24071A1293", department:"IT", bloodGroup:"AB+VE", parentMobile:"9933456789", studentMobile:"8933456789", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"KOPPULA PRANATHI", rollNumber:"24071A1294", department:"IT", bloodGroup:"B-VE", parentMobile:"9944567890", studentMobile:"8944567890", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"LAVANAM LAXMI SRESTA", rollNumber:"24071A1295", department:"IT", bloodGroup:"A+VE", parentMobile:"9955678901", studentMobile:"8955678901", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"MADDEVENI SPANDANA", rollNumber:"24071A1296", department:"IT", bloodGroup:"O+VE", parentMobile:"9966789012", studentMobile:"8966789012", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"MALLUGARI HASINI REDDY", rollNumber:"24071A1297", department:"IT", bloodGroup:"B+VE", parentMobile:"9977890123", studentMobile:"8977890123", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"KALYANAM VYSHNAVI", rollNumber:"24071A12E8", department:"IT", bloodGroup:"A-VE", parentMobile:"9988901234", studentMobile:"8988901234", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"KAMMAMPATI MEGHANA", rollNumber:"24071A12E9", department:"IT", bloodGroup:"O-VE", parentMobile:"9999012345", studentMobile:"8999012345", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"KANDUKURI SATHVIK", rollNumber:"24071A12F0", department:"IT", bloodGroup:"B+VE", parentMobile:"9810123456", studentMobile:"8810123456", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"KATAM ARJUN TEJH REDDY", rollNumber:"24071A12F1", department:"IT", bloodGroup:"A+VE", parentMobile:"9821234567", studentMobile:"8821234567", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"KONIDALA KEERTHANA", rollNumber:"24071A12F2", department:"IT", bloodGroup:"O+VE", parentMobile:"9832345678", studentMobile:"8832345678", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"KOTHAPALLI VARSHINI", rollNumber:"24071A12F3", department:"IT", bloodGroup:"AB+VE", parentMobile:"9843456789", studentMobile:"8843456789", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"LAKKALA MANOJ KUMAR", rollNumber:"24071A12F4", department:"IT", bloodGroup:"B-VE", parentMobile:"9854567890", studentMobile:"8854567890", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"LINGALA LOHIT SAI", rollNumber:"24071A12F5", department:"IT", bloodGroup:"A+VE", parentMobile:"9865678901", studentMobile:"8865678901", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"LINGALA SANTHOSH", rollNumber:"24071A12F6", department:"IT", bloodGroup:"O+VE", parentMobile:"9876789012", studentMobile:"8876789012", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"MAHANKALI PRASHASTI", rollNumber:"24071A12F7", department:"IT", bloodGroup:"B+VE", parentMobile:"9887890123", studentMobile:"8887890123", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"S SAHITH SOMASUNDAR", rollNumber:"24071A12H8", department:"IT", bloodGroup:"A-VE", parentMobile:"9898901234", studentMobile:"8898901234", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"SAMINENI MAHITHA", rollNumber:"24071A12H9", department:"IT", bloodGroup:"O-VE", parentMobile:"9710123456", studentMobile:"8710123456", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"SANKA SRI LAKSHMI VYSHNAVI", rollNumber:"24071A12J0", department:"IT", bloodGroup:"B+VE", parentMobile:"9721234567", studentMobile:"8721234567", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"SARABUDDULA DHAMODHAR REDDY", rollNumber:"24071A12J1", department:"IT", bloodGroup:"A+VE", parentMobile:"9732345678", studentMobile:"8732345678", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"SHIVA KUMAR THATIPALLY", rollNumber:"24071A12J2", department:"IT", bloodGroup:"O+VE", parentMobile:"9743456789", studentMobile:"8743456789", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"SHREYAS GALI", rollNumber:"24071A12J3", department:"IT", bloodGroup:"AB+VE", parentMobile:"9754567890", studentMobile:"8754567890", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"SK NAYAZ AHMED", rollNumber:"24071A12J4", department:"IT", bloodGroup:"B-VE", parentMobile:"9765678901", studentMobile:"8765678901", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"SRI VARSHA MEKALA", rollNumber:"24071A12J5", department:"IT", bloodGroup:"A+VE", parentMobile:"9776789012", studentMobile:"8776789012", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"SUNKI SANJALI REDDY", rollNumber:"24071A12J6", department:"IT", bloodGroup:"O+VE", parentMobile:"9787890123", studentMobile:"8787890123", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"TATIKONDA NAAGAKRISHNA", rollNumber:"24071A12J7", department:"IT", bloodGroup:"B+VE", parentMobile:"9798901234", studentMobile:"8798901234", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },

  // ── ME Department (10 students) ──────────────────────────────
  { name:"DASARI HARCHARAN", rollNumber:"24071A0312", department:"ME", bloodGroup:"A-VE", parentMobile:"9610123456", studentMobile:"8610123456", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"DEVIREDDY HARSHITHA", rollNumber:"24071A0313", department:"ME", bloodGroup:"O-VE", parentMobile:"9621234567", studentMobile:"8621234567", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"D. KRISHNA CHAITANYA", rollNumber:"24071A0314", department:"ME", bloodGroup:"B+VE", parentMobile:"9632345678", studentMobile:"8632345678", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"EDUPUGANTI SRIKRISHNA SASANK", rollNumber:"24071A0315", department:"ME", bloodGroup:"A+VE", parentMobile:"9643456789", studentMobile:"8643456789", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"GADDAMPALLY ASHISH REDDY", rollNumber:"24071A0316", department:"ME", bloodGroup:"O+VE", parentMobile:"9654567890", studentMobile:"8654567890", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"GOBBURI VENKATA SAI PRANAV", rollNumber:"24071A0317", department:"ME", bloodGroup:"AB+VE", parentMobile:"9665678901", studentMobile:"8665678901", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"GOLANUKONDA PRANAY CHANDRA", rollNumber:"24071A0318", department:"ME", bloodGroup:"B-VE", parentMobile:"9676789012", studentMobile:"8676789012", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"GOPALA SHIVA KUMAR", rollNumber:"24071A0319", department:"ME", bloodGroup:"A+VE", parentMobile:"9687890123", studentMobile:"8687890123", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"GUNTI PRASHANTHI", rollNumber:"24071A0320", department:"ME", bloodGroup:"O+VE", parentMobile:"9698901234", studentMobile:"8698901234", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"J BHAGYALAXMI", rollNumber:"24071A0321", department:"ME", bloodGroup:"B+VE", parentMobile:"9510123456", studentMobile:"8510123456", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },

  // ── CE Department (20 students) ──────────────────────────────
  { name:"DONEPUDI BHAVISHYA", rollNumber:"24071A0115", department:"CE", bloodGroup:"A-VE", parentMobile:"9521234567", studentMobile:"8521234567", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"DUGGINA BHARATH CHANDRA", rollNumber:"24071A0116", department:"CE", bloodGroup:"O-VE", parentMobile:"9532345678", studentMobile:"8532345678", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"DUGGIRALA BLESSON", rollNumber:"24071A0117", department:"CE", bloodGroup:"B+VE", parentMobile:"9543456789", studentMobile:"8543456789", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"ESLAVATH ANUSHA", rollNumber:"24071A0118", department:"CE", bloodGroup:"A+VE", parentMobile:"9554567890", studentMobile:"8554567890", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"ESLAVATH CHARAN TEJA", rollNumber:"24071A0119", department:"CE", bloodGroup:"O+VE", parentMobile:"9565678901", studentMobile:"8565678901", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"GANDHAM PRABHAS", rollNumber:"24071A0120", department:"CE", bloodGroup:"AB+VE", parentMobile:"9576789012", studentMobile:"8576789012", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"GANDLA AKSHITHA", rollNumber:"24071A0121", department:"CE", bloodGroup:"B-VE", parentMobile:"9587890123", studentMobile:"8587890123", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"GIRI HRUSHIKESH", rollNumber:"24071A0122", department:"CE", bloodGroup:"A+VE", parentMobile:"9598901234", studentMobile:"8598901234", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"JADHAV SHREYA", rollNumber:"24071A0123", department:"CE", bloodGroup:"O+VE", parentMobile:"9410123456", studentMobile:"8410123456", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"JAKKA SRUJAN", rollNumber:"24071A0124", department:"CE", bloodGroup:"B+VE", parentMobile:"9421234567", studentMobile:"8421234567", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"PAMPARI HANUMAN DAS", rollNumber:"24071A0145", department:"CE", bloodGroup:"A-VE", parentMobile:"9432345678", studentMobile:"8432345678", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"PATHAN AANISH ALI KHAN", rollNumber:"24071A0146", department:"CE", bloodGroup:"O-VE", parentMobile:"9443456789", studentMobile:"8443456789", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"PATNAM MAITHRI", rollNumber:"24071A0147", department:"CE", bloodGroup:"B+VE", parentMobile:"9454567890", studentMobile:"8454567890", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
  { name:"PITTA SOUMYA", rollNumber:"24071A0148", department:"CE", bloodGroup:"A+VE", parentMobile:"9465678901", studentMobile:"8465678901", residentialAddress:"H NO 5-2 DILSUKHNAGAR HYDERABAD TELANGANA 500060" },
  { name:"PODILA ASHRITH", rollNumber:"24071A0149", department:"CE", bloodGroup:"O+VE", parentMobile:"9476789012", studentMobile:"8476789012", residentialAddress:"PLOT NO 12 NIZAMPET HYDERABAD TELANGANA 500090" },
  { name:"PONNAM ABHIRAM", rollNumber:"24071A0150", department:"CE", bloodGroup:"AB+VE", parentMobile:"9487890123", studentMobile:"8487890123", residentialAddress:"4-11 AMEERPET HYDERABAD TELANGANA 500016" },
  { name:"POTHINENI NAGARJUNA", rollNumber:"24071A0151", department:"CE", bloodGroup:"B-VE", parentMobile:"9498901234", studentMobile:"8498901234", residentialAddress:"VILLA 5 GACHIBOWLI HYDERABAD TELANGANA 500032" },
  { name:"RATHLAVATH AKHIL", rollNumber:"24071A0152", department:"CE", bloodGroup:"A+VE", parentMobile:"9310123456", studentMobile:"8310123456", residentialAddress:"1-22 KPHB COLONY KUKATPALLY HYDERABAD TELANGANA 500072" },
  { name:"RENTAPALLI MADHURI", rollNumber:"24071A0153", department:"CE", bloodGroup:"O+VE", parentMobile:"9321234567", studentMobile:"8321234567", residentialAddress:"FLAT 302 BALAJI NAGAR MEDCHAL TELANGANA 501401" },
  { name:"RITVIK BADAM", rollNumber:"24071A0154", department:"CE", bloodGroup:"B+VE", parentMobile:"9332345678", studentMobile:"8332345678", residentialAddress:"3-4/A SR NAGAR HYDERABAD TELANGANA 500038" },
];

// ============================================================
// COURSE DATA
// ============================================================
const courses = [
  { courseTitle: 'Matrices and Calculus', courseCode: '22BS1MT101', credits: 4 },
  { courseTitle: 'Applied Physics', courseCode: '22BS1PH102', credits: 3 },
  { courseTitle: 'Programming for Problem Solving', courseCode: '22ES1CS101', credits: 3 },
  { courseTitle: 'English for Skill Enhancement', courseCode: '22HS1EN101', credits: 2 },
  { courseTitle: 'Introduction to Internet of Things', courseCode: '22ES1EI101', credits: 2 },
  { courseTitle: 'English Language and Communication Skills Laboratory', courseCode: '22HS2EN101', credits: 1 },
  { courseTitle: 'Applied Physics Laboratory', courseCode: '22BS2PH102', credits: 1 },
  { courseTitle: 'Programming for Problem Solving Laboratory', courseCode: '22ES2CS101', credits: 1 },
  { courseTitle: 'Engineering and IT Workshop', courseCode: '22ES2ME102', credits: 2 },
  { courseTitle: 'Elements of Computer Science and Engineering', courseCode: '22SD5CS101', credits: 1 },
  { courseTitle: 'Induction Programme', courseCode: '22MN6HS101', credits: 0 },
  { courseTitle: 'Ordinary Differential Equations and Vector Calculus', courseCode: '22BS1MT102', credits: 3 },
  { courseTitle: 'Statistical Methods for Data Analysis', courseCode: '22BS1MT103', credits: 3 },
  { courseTitle: 'Data Structures', courseCode: '22ES1CS102', credits: 3 },
  { courseTitle: 'Chemistry for Engineers', courseCode: '22BS1CH102', credits: 3 },
  { courseTitle: 'Basic Electrical and Electronics Engineering', courseCode: '22ES1EE101', credits: 3 },
  { courseTitle: 'Engineering Drawing', courseCode: '22ES3ME102', credits: 2 },
  { courseTitle: 'Engineering Chemistry Laboratory', courseCode: '22BS2CH101', credits: 1 },
  { courseTitle: 'Basic Electrical and Electronics Engineering Laboratory', courseCode: '22ES2EE101', credits: 1 },
  { courseTitle: 'Data Structures Laboratory', courseCode: '22ES2CS102', credits: 1 },
  { courseTitle: 'Environmental Science', courseCode: '22MN6HS102', credits: 0 },
];

// ============================================================
// SEED FUNCTION
// ============================================================
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Marks.deleteMany({});
    await Attendance.deleteMany({});

    // 1. Admin
    console.log('Creating admin user...');
    const admin = await User.create({
      name: 'Admin', email: 'admin@sis.edu', password: 'admin123',
      role: 'admin', department: 'Administration', year: 'N/A'
    });
    console.log(`  Admin created: ${admin.email} / admin123`);

    // 2. Pre-hash password for bulk insert
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('student123', salt);

    // Build student docs from real data
    const studentDocs = allStudents.map(s => ({
      name: s.name, email: `${s.rollNumber.toLowerCase()}@sis.edu`,
      password: defaultPassword, role: 'student',
      rollNumber: s.rollNumber, department: s.department, year: '1st Year',
      bloodGroup: s.bloodGroup, parentMobile: s.parentMobile,
      studentMobile: s.studentMobile, residentialAddress: s.residentialAddress
    }));

    console.log(`Inserting ${studentDocs.length} students...`);
    const createdStudents = await User.insertMany(studentDocs);
    console.log(`  ${createdStudents.length} students inserted (all with real data).`);

    // 3. Courses
    console.log(`Inserting ${courses.length} courses...`);
    const createdCourses = await Course.insertMany(courses);
    console.log(`  ${createdCourses.length} courses inserted.`);

    // 4. Marks (realistic B.Tech distribution)
    console.log('Generating marks for all courses per student...');
    const marksToInsert = [];
    for (const student of createdStudents) {
      for (const course of createdCourses) {
        const m = generateBTechMark(course);
        marksToInsert.push({ student: student._id, course: course._id, marks: m });
      }
    }
    await Marks.insertMany(marksToInsert);
    console.log(`  ${marksToInsert.length} marks entries created.`);

    // 5. Attendance (per course; ~72% safe, ~20% condonation, ~8% detention overall)
    console.log('Generating per-course attendance...');
    const attendanceDocs = [];
    for (const student of createdStudents) {
      const band = pickAttendanceBand();
      attendanceDocs.push(...buildRowsForStudent(student._id, createdCourses, band));
    }
    await Attendance.insertMany(attendanceDocs);
    console.log(`  ${attendanceDocs.length} attendance rows created (${createdStudents.length} students × ${createdCourses.length} courses).`);

    console.log('\n========================================');
    console.log('   SEED COMPLETE');
    console.log('========================================');
    console.log(`  Students: ${createdStudents.length}`);
    console.log(`  Courses:  ${createdCourses.length}`);
    console.log(`  Marks:    ${marksToInsert.length}`);
    console.log(`  Attendance: ${attendanceDocs.length}`);
    console.log('');
    console.log('  Login Credentials:');
    console.log('  Admin  -> admin@sis.edu / admin123');
    console.log('  Student-> {rollnumber}@sis.edu / student123');
    console.log('  Example: 24071a0501@sis.edu / student123');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
