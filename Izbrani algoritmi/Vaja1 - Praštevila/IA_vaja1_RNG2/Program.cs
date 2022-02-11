using System;
using System.IO;
using System.Collections;
using System.Reflection.Metadata.Ecma335;
using System.Runtime.InteropServices.ComTypes;

namespace IA_vaja1_RNG2
{
    class Program
    {
        static private UInt32 randomNum = 0;
        static private UInt32 m_size = 0;
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
                    case 1:
                        Console.Write("Input your number: ");
                        randomNum = Convert.ToUInt32(Console.ReadLine());
                        m_size = Convert.ToUInt32(Math.Floor(Math.Log2(randomNum)) + 1);
                        break;
                    case 2:                       
                        if(randomNum == 0)
                        {
                            Console.Write("Input m: ");
                            m_size = Convert.ToUInt32(Console.ReadLine());
                            Console.Write("Input R: ");
                            UInt32 r = Convert.ToUInt32(Console.ReadLine());
                            randomNum = SuperDuper(m_size, r);
                        }
                        else
                        {
                            randomNum = SuperDuper(m_size, randomNum);
                        }                     
                        break;
                    case 3: //Izbrana naivna metoda   
                    {
                        var watch = System.Diagnostics.Stopwatch.StartNew();
                        UInt32 x = NaivnaMetoda(randomNum);
                        watch.Stop();
                        var elapsedS = watch.Elapsed.TotalSeconds;
                        Console.WriteLine("NaivnaMetoda output: " + x.ToString());
                        Console.WriteLine("Elapsed s: " + elapsedS);
                        Console.Write("Run test? (y/n) ");
                        if (Console.ReadLine() == "y")
                        {
                            JePraStevilo(x);
                        }
                        Console.Write("Press any key to continue...");
                        Console.ReadKey();
                        break;
                    }
                    case 4: //Miller-rabinov test
                    {
                        Console.Write("Input s: ");
                        UInt32 s = Convert.ToUInt32(Console.ReadLine());
                        int output = -1;
                        UInt32 x = randomNum;
                        var watch = System.Diagnostics.Stopwatch.StartNew();
                        while ((output = MillerRabin(ref x, s)) == (int)MR.SESTAVLJENO_STEVILO) 
                        {
                            x += 2;
                        }
                        watch.Stop();
                        var elapsedS = watch.Elapsed.TotalSeconds;
                        Console.WriteLine("Elapsed s: " + elapsedS);
                        string stringOutput = "";
                        if(output == (int)MR.PRASTEVILO)
                        {
                            stringOutput = "PRASTEVILO";
                        }
                        else if (output == (int)MR.VERJETNO_PRASTEVILO)
                        {
                            stringOutput = "VERJETNO_PRASTEVILO";
                        }
                        else if(output == (int)MR.SESTAVLJENO_STEVILO)
                        {
                            stringOutput = "SESTAVLJENO_STEVILO";
                        }
                        
                        Console.WriteLine("MillerRabin output: " + x.ToString() + " -> " + stringOutput);
                        Console.Write("Run test? (y/n) ");
                        if (Console.ReadLine() == "y")
                        {
                            JePraStevilo(x);
                        }
                        Console.Write("Press any key to continue...");
                        Console.ReadKey();
                        break;
                    }
                    case 5:
                        {
                            UInt32 R = 1;
                            string filePath = "testsNaivna.txt";
                            createFile(filePath);
                            writeToFile(filePath, "st_bitov:\tsekunde:\n");
                            for (int n = 4; n <= 32; n++)
                            {
                                //Priprava parametrov.
                                m_size = Convert.ToUInt32(n);
                                R = SuperDuper(m_size, R);

                                //Diagnostika
                                var watch = System.Diagnostics.Stopwatch.StartNew();
                                UInt32 x = NaivnaMetoda(R);
                                watch.Stop();
                                var elapsedS = watch.Elapsed.TotalMilliseconds;

                                //Zapis rezultata
                                writeToFile(filePath, n + "\t" + elapsedS.ToString().Replace(',', '.') + "\n");
                            }                           
                            break;
                        }
                    case 6:
                        {
                            UInt32 R = 1;
                            string filePath = "testsMR1.txt";
                            createFile(filePath);
                            writeToFile(filePath, "st_bitov:\tsekunde:\n");
                            for (int n = 4; n <= 32; n++)
                            {
                                //Priprava parametrov.
                                m_size = Convert.ToUInt32(n);
                                R = SuperDuper(m_size, R);

                                //Diagnostika
                                var watch = System.Diagnostics.Stopwatch.StartNew();
                                while (MillerRabin(ref R, 1) == (int)MR.SESTAVLJENO_STEVILO)
                                {
                                    R += 2;
                                }
                                watch.Stop();
                                var elapsedS = watch.Elapsed.TotalMilliseconds;

                                //Zapis rezultata
                                writeToFile(filePath, n + "\t" + elapsedS.ToString().Replace(',', '.') + "\n");
                            }
                            break;
                        }
                    case 7:
                        {
                            UInt32 R = 1;
                            string filePath = "testsMR2.txt";
                            createFile(filePath);
                            writeToFile(filePath, "MR_s:\tsekunde:\n");
                            for (int s = 1; s <= 20; s++)
                            {
                                //Priprava parametrov.
                                m_size = 32;
                                R = SuperDuper(m_size, R);

                                //Diagnostika
                                var watch = System.Diagnostics.Stopwatch.StartNew();
                                while (MillerRabin(ref R, (UInt32)s) == (int)MR.SESTAVLJENO_STEVILO)
                                {
                                    R += 2;
                                }
                                watch.Stop();
                                var elapsedS = watch.Elapsed.TotalMilliseconds;

                                //Zapis rezultata
                                writeToFile(filePath, s + "\t" + elapsedS.ToString().Replace(',', '.') + "\n");
                            }

                            break;
                        }
                    case 9: //RandomNum nazaj na 0
                    {
                        randomNum = 0;
                        m_size = 0;
                        break;
                    }
                }
            }
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

        static int printMenu()
        {
            Console.Clear();
            Console.WriteLine("Vaja 1 RNG-PrimeNumbers");
            Console.WriteLine("====================================");
            Console.WriteLine("1. Vnesi svoje število");
            Console.WriteLine("2. Generiraj naključno število");
            if(randomNum > 0)
            {
                Console.WriteLine("3. Naivna metoda");
                Console.WriteLine("4. Miller-Rabin metoda");               
            }
            Console.WriteLine("5. Testi naivna");
            Console.WriteLine("6. Testi MR1");
            Console.WriteLine("7. Testi MR2");
            Console.WriteLine("0. Exit");
            Console.WriteLine("====================================");
            Console.WriteLine("Generated random number: " + randomNum.ToString());
            Console.Write("Choose a number: ");
            return Convert.ToInt32(Console.ReadLine());
        }      

        static bool JeCeloStevilo(double c)
        {
            if (c % 1 > 0)
            {
                return false;
            }
            else
            {
                return true;
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

        static UInt32 NaivnaMetoda(UInt32 p)
        {
            //Generiraj naključno n-mestno število p
            //Generiranje se zgodi pred klicem funkcije v main().
            if (p % 2 == 0) //Praštevilo ne more biti sodo.
            {
                p += 1;
            }

            while(true)
            {
                int j = 3;
                while (!JeCeloStevilo((double) p / (double) j) && j <= Math.Sqrt(p))
                {
                    j += 2;
                }

                if (j > Math.Sqrt(p)) //Potencialnega delitelja od p nismo našli.
                {
                    return p;
                }
                p += 2; //Naslednje liho število.
            }
        }

        static int MillerRabin(ref UInt32 p, UInt32 s)
        {
            //0 = Praštevilo
            //1 = Verjetno_praštevilo
            //2 = Sestavljeno_praštevilo
            if (p <= 3)
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
                d = d/ 2;
                k += 1;
            } 
            UInt32 a = 1;
            for (int j = 1; j <= s; j++)
            {
                a = MyRandom(2, p - 2, a);
                UInt64 x = ModularExponentiation(a, d, p);
                if (x != 1)
                {
                    for (int i = 0; i <= k-1; i++)
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
            var myBitArray = new BitArray(BitConverter.GetBytes(b)); //Število pretvorimo v bitni zapis.
            int len = (int)Math.Floor(Math.Log2(b)) + 1; //Ugotovimo koliko bitov potrebujemo za zapis števila v binarnem sistemu.
            for (int i = len-1; i >= 0; i--)
            {
                d = (d * d) % n;
                if(myBitArray[i]) //Če je b == 1
                {
                    d = (d * a) % n;
                }
            }
            return d;
        }

        static UInt32 MyRandom(UInt32 a, UInt32 b, UInt32 r)
        {
            return Convert.ToUInt32(a + SuperDuper(m_size, r) % (b - a + 1));
        }

        static UInt32 SuperDuper(UInt32 m = 32, UInt32 R = 1, UInt32 a = 69069, UInt32 b = 0)
        {
            m = Convert.ToUInt32(Math.Pow(2, m) - 1);
            return Convert.ToUInt32(((a * R) + b) % m);
        }
    }
}
