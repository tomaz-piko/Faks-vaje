using System;
using System.Collections;
using System.IO;

namespace IA_vaja2_RSA
{
    public class MyBitWritter
    {
        private int bitCount = 0;
        private string filePath;
        private BitArray bitBuffer = new BitArray(8);

        public MyBitWritter(string _filePath)
        {
            this.filePath = _filePath;
            if(File.Exists(_filePath))
            {
                var file = File.Create(_filePath);
                file.Close();
            }
        }

        public void writeBit(bool b)
        {            
            bitBuffer[bitCount] = b;
            bitCount++;
            if (bitCount == 8)
            {
                writeByte();
            }
        }

        public void writeByte()
        {
            using (FileStream fs = new FileStream(filePath, FileMode.Append))
            {
                fs.WriteByte(bitArrayToByte());
            }
            bitCount = 0;
            bitBuffer = new BitArray(8);
        }

        private byte bitArrayToByte()
        {
            byte[] ret = new byte[1];
            bitBuffer.CopyTo(ret, 0);
            return ret[0];
        }

        public void flush()
        {
            
            if(bitCount != 0)
            {
                int bitsLeft = bitCount;
                while (bitsLeft < 8)
                {
                    writeBit(false);
                    bitsLeft++;
                }
            }         
        }
    }

    class MyRandom
    {
        private UInt32 R;
        private UInt32 a;
        private UInt32 b;
        private UInt32 m;

        public MyRandom()
        {
            R = 1243;
            a = 69069;
            b = 0;
            m = m = Convert.ToUInt32(Math.Pow(2, 32) - 1);
        }

        public MyRandom(UInt32 _m, UInt32 _R=1243)
        {
            R = _R;
            a = 69069;
            b = 0;
            m = Convert.ToUInt32(Math.Pow(2, _m) - 1);
        }

        public UInt32 Random(UInt32 a, UInt32 b)
        {
            return Convert.ToUInt32((a + (SuperDuper()) % (b - a + 1)));
        }

        private UInt32 SuperDuper()
        {
            UInt32 prevR = R;
            R = Convert.ToUInt32(((a * R) + b) % m);
            if (R == prevR) R++;
            return R;
        }
    }

    class Program
    {
        public static UInt32 key_size = 0;
        public const int MR_S = 5;
        public static UInt32 p = 0;
        public static UInt32 q = 0;
        public static MyRandom myRand = null;

        enum MR
        {
            PRASTEVILO,
            VERJETNO_PRASTEVILO,
            SESTAVLJENO_STEVILO
        }

        static void Main(string[] args)
        {
            bool running = true;
            while (running)
            {
                int key = printMenu();
                switch (key)
                {
                    case 0:
                        {
                            running = false;
                            break;
                        }
                    case 1: //Tvorba ključev
                        {                                                
                            Console.Write("Vnesi število bitov za zapis ključev: ");
                            key_size = Convert.ToUInt32(Console.ReadLine());
                            myRand = new MyRandom(key_size);
                            p = GenerateKey(0);
                            //TestPrime(p);
                            q = GenerateKey(p);
                            //TestPrime(q);
                            Console.WriteLine("P: " + p);
                            Console.WriteLine("Q: " + q);
                            UInt32 n = p * q;
                            UInt32 euler_n = (p - 1) * (q - 1);
                            UInt32 e = myRand.Random(2, euler_n - 1);
                            while ((e % 2 == 0) || (GCD(e, euler_n) > 1)) {
                                e = myRand.Random(2, euler_n - 1);
                            }
                            Int32 d = ModularLinearEquationSolver(e, 1, euler_n);
                            Console.WriteLine("n: " + n.ToString());
                            Console.WriteLine("euler_n: " + euler_n.ToString());
                            Console.WriteLine("e: " + e.ToString());
                            Console.WriteLine("d: " + d.ToString());
                            File.WriteAllText(@"pubkey.txt", e.ToString() + "\n" + n.ToString());
                            File.WriteAllText(@"privkey.txt", d.ToString() + "\n" + n.ToString());
                            Console.ReadLine();
                            break;
                        }
                    case 2: //Kodiranje
                        {
                            UInt32 e = 0, n = 0; 
                            ReadKeyFromFile("pubkey.txt", ref e, ref n);
                            int block_len = (int)Math.Floor(Math.Log2(p * q)); //Velikost blokov pri branju sporočila.
                            int code_len = (int)Math.Ceiling(Math.Log2(p * q)); //Velikost blokov kodirane kode, ki se zapiše v datoteko.
                            var watch = System.Diagnostics.Stopwatch.StartNew();
                            byte[] M = File.ReadAllBytes(@"msg.txt");
                            var msg_bitArray = new System.Collections.BitArray(M);                         
                            int steps = (int)Math.Ceiling((double)msg_bitArray.Length / (double)block_len);
                            MyBitWritter bw = new MyBitWritter("enc.txt");
                            for (int i = 0; i < steps; i++)
                            {
                                int start = i * block_len;
                                int end = (i + 1) * block_len;
                                if (end > msg_bitArray.Length)
                                {
                                    end = msg_bitArray.Length;
                                }
                                int counter = 0;
                                UInt32 block_num = 0;
                                for (int j = end - 1; j >= start; j--) //Beri bit array po blokah velikosti n.
                                {
                                    if(msg_bitArray[j]) //Binarno v število.
                                    {
                                        block_num += (UInt32)Math.Pow(2, counter);
                                    }
                                    counter++;
                                }
                                UInt64 C = ModularExponentiation(block_num, e, n); //Zašifriramo en blok.
                                int C_b;
                                if (C > 0)
                                {
                                    C_b = (int)Math.Floor(Math.Log2(C)) + 1; //Koliko bitov potrebujemo za zapis (kontrola... vse bi mogvo bit block_len)
                                }
                                else
                                { 
                                    break;
                                }
                                //C v bite.
                                //C zapisat po bitah v datoteko...
                                //Za zapis porabi code_len bitov, 
                                var C_bitArray = new System.Collections.BitArray(BitConverter.GetBytes(C));                              
                                for (int k = code_len - 1; k >= 0; k--)
                                {
                                    bool b;
                                    if(k>=C_b) { b = false; }
                                    else { b = C_bitArray[k];  }
                                    bw.writeBit(b);
                                }
                            }
                            bw.flush();
                            watch.Stop();
                            var elapsedS = watch.Elapsed.TotalSeconds;
                            Console.WriteLine("ENCODING COMPLETE: " + elapsedS + "s");
                            Console.ReadLine();
                            break;
                        }
                    case 3: //Dekodiranje
                        {
                            UInt32 d = 0, n = 0; //Testni primer.
                            ReadKeyFromFile("privkey.txt", ref d, ref n);
                            int code_len = (int)Math.Floor(Math.Log2(p * q)); //Velikost blokov kodirane kode, ki se zapiše v datoteko. Obratno kot pri kodiranju
                            int block_len = (int)Math.Ceiling(Math.Log2(p * q)); //Velikost blokov pri branju sporočila. Obratno kot pri kodiranju
                            var watch = System.Diagnostics.Stopwatch.StartNew();
                            byte[] C = File.ReadAllBytes(@"enc.txt");
                            var msg_bitArray = new System.Collections.BitArray(C);
                            int steps = (int)Math.Floor((double)msg_bitArray.Length / (double)block_len);
                            MyBitWritter bw = new MyBitWritter("dec.txt");
                            for (int i = 0; i < steps; i++)
                            {
                                int start = i * block_len;
                                int end = (i + 1) * block_len;
                                if (end > msg_bitArray.Length)
                                {
                                    break;
                                }
                                int counter = 0;
                                UInt32 block_num = 0;
                                for (int j = end - 1; j >= start; j--) //Beri bit array po blokah velikosti n.
                                {
                                    if (msg_bitArray[j]) //Binarno v število.
                                    {
                                        block_num += (UInt32)Math.Pow(2, counter);
                                    }
                                    counter++;
                                }
                                UInt64 M = ModularExponentiation(block_num, d, n); //Zašifriramo en blok.
                                int M_b = 0;
                                if (M > 0)
                                {
                                    M_b = (int)Math.Floor(Math.Log2(M)) + 1; //Koliko bitov potrebujemo za zapis (kontrola... vse bi mogvo bit block_len)
                                }
                                else
                                { //Todo pazi, da so zapisi istih dolzin.
                                    break;
                                }
                                //C v bite.
                                //C zapisat po bitah v datoteko...
                                //Za zapis porabi code_len bitov, 
                                var M_bitArray = new System.Collections.BitArray(BitConverter.GetBytes(M));

                                if(i != steps-1)
                                {
                                    for(int k = code_len-1; k >= M_b; k--)
                                    {
                                        bw.writeBit(false);
                                    }
                                }
                                else
                                {
                                    int fillerCount = 8 - (((i * code_len) + M_b) % 8);
                                    fillerCount = (fillerCount == 8) ? 0 : fillerCount;
                                    for (int k = 0; k < fillerCount ; k++)
                                    {
                                        bw.writeBit(false);
                                    }
                                }
                                for (int k = M_b - 1; k >= 0; k--)
                                {
                                    bw.writeBit(M_bitArray[k]);
                                }
                            }
                            bw.flush();
                            watch.Stop();
                            var elapsedS = watch.Elapsed.TotalSeconds;
                            Console.WriteLine("DECODING COMPLETE in : " + elapsedS + "s");
                            Console.ReadKey();
                            break;
                        }
                    case 4: //Test tvorbe ključev
                        {
                            UInt32 R = 1;
                            string filePath = "testKljucev.txt";
                            createFile(filePath);
                            writeToFile(filePath, "st_bitov:\tms:\n");
                            for (int n = 3; n <= 15; n++)
                            {
                                //Diagnostika
                                key_size = (UInt32)n;
                                myRand = new MyRandom(key_size);
                                var watch = System.Diagnostics.Stopwatch.StartNew();
                                p = GenerateKey(0);                             
                                q = GenerateKey(p);
                                watch.Stop();
                                var elapsedS = watch.Elapsed.TotalMilliseconds;
                                Console.WriteLine("Key size: " + key_size + " P: " + p + "\tQ: " + q);
                                //Zapis rezultata
                                writeToFile(filePath, n + "\t" + elapsedS.ToString().Replace(',', '.') + "\n");
                            }
                            Console.ReadLine();
                            break;
                        }
                    case 5: //Test kodiranja in dekodiranja
                        {
                            createFile("testKodiranjeDekodiranje.txt");
                            writeToFile("testKodiranjeDekodiranje.txt", "št. bitov\tkodiranje\tdekodiranje\n");
                            for(int m = 12; m <= 36; m++)
                            {
                                //2^i zapišemo v datoteko, to bo sporočilo poljubnega števila bitov
                                UInt64 msg = Convert.ToUInt64(Math.Pow(2, m-1));
                                File.WriteAllText(@"testMsg.txt", msg.ToString());

                                //Generiramo ključa in pripravimo podatke.
                                key_size = Convert.ToUInt32(14);
                                myRand = new MyRandom(key_size);
                                p = GenerateKey(0);
                                q = GenerateKey(p);
                                UInt32 n = p * q;
                                UInt32 euler_n = (p - 1) * (q - 1);
                                UInt32 e = myRand.Random(2, euler_n - 1);
                                while ((e % 2 == 0) || (GCD(e, euler_n) > 1))
                                {
                                    e = myRand.Random(2, euler_n - 1);
                                }
                                Int32 d = ModularLinearEquationSolver(e, 1, euler_n);

                                //KODIRANJE
                                //Preberemo sporočilo po bitah iz iste datoteke.
                                int block_len = (int)Math.Floor(Math.Log2(p * q)); //Velikost blokov pri branju sporočila.
                                int code_len = (int)Math.Ceiling(Math.Log2(p * q)); //Velikost blokov kodirane kode, ki se zapiše v datoteko.
                                var watch = System.Diagnostics.Stopwatch.StartNew(); //Začnemo merjenje časa.
                                byte[] M = File.ReadAllBytes(@"testMsg.txt");
                                var msg_bitArray = new System.Collections.BitArray(M);
                                int steps = (int)Math.Ceiling((double)msg_bitArray.Length / (double)block_len);
                                MyBitWritter bw = new MyBitWritter("testEnc.txt");
                                for (int i = 0; i < steps; i++)
                                {
                                    int start = i * block_len;
                                    int end = (i + 1) * block_len;
                                    if (end > msg_bitArray.Length)
                                    {
                                        end = msg_bitArray.Length;
                                    }
                                    int counter = 0;
                                    UInt32 block_num = 0;
                                    for (int j = end - 1; j >= start; j--)
                                    {
                                        if (msg_bitArray[j]) //Binarno v število.
                                        {
                                            block_num += (UInt32)Math.Pow(2, counter);
                                        }
                                        counter++;
                                    }
                                    UInt64 _C = ModularExponentiation(block_num, e, n);
                                    int C_b;
                                    if (_C > 0)
                                    {
                                        C_b = (int)Math.Floor(Math.Log2(_C)) + 1;
                                    }
                                    else
                                    {
                                        break;
                                    }
                                    var C_bitArray = new System.Collections.BitArray(BitConverter.GetBytes(_C));
                                    for (int k = code_len - 1; k >= 0; k--)
                                    {
                                        bool b;
                                        if (k >= C_b) { b = false; }
                                        else { b = C_bitArray[k]; }
                                        bw.writeBit(b);
                                    }
                                }
                                bw.flush();
                                watch.Stop();
                                var encodingS = watch.Elapsed.TotalSeconds;

                                //DEKODIRANJE
                                int tmp = code_len;
                                code_len = block_len; //Velikost blokov kodirane kode, ki se zapiše v datoteko. Obratno kot pri kodiranju
                                block_len = tmp; //Velikost blokov pri branju sporočila. Obratno kot pri kodiranju
                                watch = System.Diagnostics.Stopwatch.StartNew();
                                byte[] C = File.ReadAllBytes(@"testEnc.txt");
                                msg_bitArray = new System.Collections.BitArray(C);
                                steps = (int)Math.Floor((double)msg_bitArray.Length / (double)block_len);
                                bw = new MyBitWritter("testDec.txt");
                                for (int i = 0; i < steps; i++)
                                {
                                    int start = i * block_len;
                                    int end = (i + 1) * block_len;
                                    if (end > msg_bitArray.Length)
                                    {
                                        break;
                                    }
                                    int counter = 0;
                                    UInt32 block_num = 0;
                                    for (int j = end - 1; j >= start; j--)
                                    {
                                        if (msg_bitArray[j]) //Binarno v število.
                                        {
                                            block_num += (UInt32)Math.Pow(2, counter);
                                        }
                                        counter++;
                                    }
                                    UInt64 _M = ModularExponentiation(block_num, (UInt32)d, n);
                                    int M_b = 0;
                                    if (_M > 0)
                                    {
                                        M_b = (int)Math.Floor(Math.Log2(_M)) + 1;
                                    }
                                    else
                                    { 
                                        break;
                                    }
                                    var M_bitArray = new System.Collections.BitArray(BitConverter.GetBytes(_M));
                                    if (i != steps - 1)
                                    {
                                        for (int k = code_len - 1; k >= M_b; k--)
                                        {
                                            bw.writeBit(false);
                                        }
                                    }
                                    else
                                    {
                                        int fillerCount = 8 - (((i * code_len) + M_b) % 8);
                                        fillerCount = (fillerCount == 8) ? 0 : fillerCount;
                                        for (int k = 0; k < fillerCount; k++)
                                        {
                                            bw.writeBit(false);
                                        }
                                    }
                                    for (int k = M_b - 1; k >= 0; k--)
                                    {
                                        bw.writeBit(M_bitArray[k]);
                                    }
                                }
                                bw.flush();
                                watch.Stop();
                                var decodingS = watch.Elapsed.TotalSeconds;
                                writeToFile("testKodiranjeDekodiranje.txt", m + "\t" + encodingS.ToString().Replace(',', '.') + "\t" + decodingS.ToString().Replace(',', '.') + "\n");
                                var lines = File.ReadAllLines("testDec.txt");
                                if(lines[0] != msg.ToString())
                                {
                                    Console.WriteLine("RSA FAILED");
                                    break;
                                }
                            }
                            Console.WriteLine("TESTING COMPLETE!");
                            Console.ReadLine();
                            break;
                        }
                }
            }
        }

        static void ReadKeyFromFile(string fileName, ref UInt32 x, ref UInt32 y)
        {
            var lines = File.ReadAllLines(@fileName);
            for (int i = 0; i < lines.Length; i += 1)
            {
                if (i == 0)
                {
                    x = Convert.ToUInt32(lines[i]);
                }
                else if (i == 1)
                {
                    y = Convert.ToUInt32(lines[i]);
                }
            }
        }

        static Int32 ModularLinearEquationSolver(UInt32 a, UInt32 b, UInt32 n)
        {
            UInt32 d = Convert.ToUInt32(Math.Floor((double)a / (double)b));
            Int32 x = 1, y = 0;
            ExtendedEuclid(a, n, ref d, ref x, ref y);
            if (d % b == 0)
            {
                if((x * ((double)b / (double)d)) < 0)
                {
                    x = Convert.ToInt32((x * ((double)b / (double)d)) + n);
                }
                else
                {
                    x = Convert.ToInt32((x * ((double)b / (double)d)) % n);
                }
                for(int i = 0; i <= d - 1; i++)
                {
                    x = Convert.ToInt32((x + i*(n / d)) % n);
                }
                return x;
            }
            else
            {
                Console.WriteLine("Rešitev ne obstaja");
                return -1;
            }
        }

        static void ExtendedEuclid(UInt32 a, UInt32 b, ref UInt32 d, ref Int32 x, ref Int32 y)
        {
            if (b == 0)
            {
                d = a;
                x = 1;
                y = 0;
            }
            else
            {
                UInt32 n_d = d;
                Int32 n_x = x;
                Int32 n_y = y;
                ExtendedEuclid(b, (a % b), ref n_d, ref n_x, ref n_y);
                d = n_d;
                x = n_y;
                y = n_x - ((Int32)(a / b)) * n_y; 
            }
        }

        static UInt32 GenerateKey(UInt32 prevKey)
        {
            //UInt32 x = myRand.Random(0, (UInt32)Math.Pow(2, key_size) - 1);
            UInt32 from = Convert.ToUInt32(Math.Pow(2, key_size - 2));
            UInt32 to = Convert.ToUInt32(Math.Pow(2, key_size) - 1);
            UInt32 x = myRand.Random(from, to);
            while (MillerRabin(ref x, MR_S) == (int)MR.SESTAVLJENO_STEVILO)
            {
                x += 2;
                if (x == prevKey) x++;
            }
            return x;
        }

        private static UInt32 GCD(UInt32 a, UInt32 b)
        {
            while (a != 0 && b != 0)
            {
                if (a > b)
                    a %= b;
                else
                    b %= a;
            }

            return a | b;
        }

        static void createFile(string filePath)
        {
            if (File.Exists(filePath))
            {

                var file = File.Create(filePath);
                file.Close();
            }
        }

        static void writeToFile(string filePath, string s)
        {
            using (FileStream fs = new FileStream(filePath, FileMode.Append))
            {
                byte[] bytes = System.Text.Encoding.UTF8.GetBytes(s);
                fs.Write(bytes, 0, bytes.Length);
            }
        }

        #region TestIfPrimeNumber
        static void TestPrime(UInt32 num)
        {
            Console.Write("Run test for " + num.ToString() + " (y/n) ");
            if (Console.ReadLine() == "y")
            {
                JePraStevilo(num);
                Console.ReadLine();
            }
        }

        static bool JePraStevilo(UInt32 p)
        {
            if (p == 0 || p == 1)
            {
                Console.WriteLine(p.ToString() + " ni praštevilo...");
                return false;
            }

            for (UInt32 a = 2; a < p / 2; a++)
            {
                if (p % a == 0)
                {
                    Console.WriteLine(p.ToString() + " ni praštevilo... deljivo z: " + a.ToString());
                    return false;
                }
            }
            Console.WriteLine(p.ToString() + " je praštevilo");
            return true;
        }
        #endregion

        #region PrintFunction
        static int printMenu()
        {
            Console.Clear();
            Console.WriteLine("Vaja 2 RSA-encoding-decoding");
            Console.WriteLine("====================================");
            Console.WriteLine("1. Izračunaj ključa");
            Console.WriteLine("2. Kodiraj");
            Console.WriteLine("3. Odkodiraj");
            Console.WriteLine("4. Test tvorbe ključev");
            Console.WriteLine("5. Test");
            Console.WriteLine("0. Exit");
            Console.WriteLine("====================================");
            Console.Write("Choose a number: ");
            
            return Convert.ToInt32(Console.ReadLine());
        }
        #endregion

        #region VAJA1
        static int MillerRabin(ref UInt32 p, UInt32 s)
        {
            //0 = Praštevilo
            //1 = Verjetno_praštevilo
            //2 = Sestavljeno_praštevilo
            if (p > 0 && p <= 3)
            {
                return (int)MR.PRASTEVILO; //Praštevilo
            }

            if (p % 2 == 0)
            {
                p += 1;
                return (int)MR.SESTAVLJENO_STEVILO;
            }

            //Poišči takšna k in d, da velja: d*2^k = p-1
            UInt32 d = p - 1;
            UInt32 k = 0;
            while (d % 2 == 0)
            {
                d = d / 2;
                k += 1;
            }
            for (int j = 1; j <= s; j++)
            {
                UInt32 a = myRand.Random(2, p - 2);
                UInt64 x = ModularExponentiation(a, d, p);
                if (x != 1)
                {
                    for (int i = 0; i <= k - 1; i++)
                    {
                        if (x == p - 1)
                        {
                            break;
                        }
                        x = (x * x) % p;
                    }
                    if (x != p - 1)
                    {
                        return (int)MR.SESTAVLJENO_STEVILO;
                    }
                }
            }
            return (int)MR.VERJETNO_PRASTEVILO;
        }

        static UInt64 ModularExponentiation(UInt32 a, UInt32 b, UInt32 n) //a = a, d = b, p = n
        {
            UInt64 d = 1;
            var myBitArray = new System.Collections.BitArray(BitConverter.GetBytes(b)); //Število pretvorimo v bitni zapis.
            int len = (int)Math.Floor(Math.Log2(b)) + 1; //Ugotovimo koliko bitov potrebujemo za zapis števila v binarnem sistemu.
            for (int i = len - 1; i >= 0; i--)
            {
                d = (d * d) % n;
                if (myBitArray[i]) //Če je b == 1
                {
                    d = (d * a) % n;
                }
            }
            return d;
        }
        #endregion
    }
}
