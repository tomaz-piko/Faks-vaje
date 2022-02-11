using System;
using System.IO;
using System.Collections.Generic;

namespace IA_vaja4_Simplex
{
    class Program
    {
        static void Main(string[] args)
        {
            string[] files = { "", "testOsnovniSimpex.txt", "testSimplex2.txt", "simplexTezko.txt", "testNedelujocSimplex.txt" };
            string file = "";
            bool running = true;
            while(running)
            {
                int key = printMenu();
                if(key > 0 && key < 5)
                {
                    file = files[key];
                    key = 1;
                }
                switch(key)
                {
                    case 0:
                        {
                            running = false;
                            break;
                        }
                    case 1:
                        {
                            readSimplexFromFile(file, out int n, out int m, out float[,] A, out float[] b, out float[] c);
                            Console.Write("Print initial data? (y / n): ");
                            string ans = Console.ReadLine();
                            if(ans == "y")
                            {
                                Console.Write("A: ");
                                printMatrix(A);
                                Console.WriteLine();
                                Console.Write("b: ");
                                printArray(b);
                                Console.WriteLine();
                                Console.Write("c: ");
                                printArray(c);
                                Console.WriteLine();
                            }                                                      
                            simplex(n, m, ref A, ref b, ref c, out float[] x, out float z);
                            printResults(x);
                            Console.WriteLine("z: " + z);
                            Console.ReadLine();
                            break;
                        }
                    case 5:
                        {
                            Console.Write("Input size (n): ");
                            int n = Convert.ToInt32(Console.ReadLine());
                            genRandomSimplex(n, n, out float[,] A, out float[] b, out float[] c);
                            Console.Write("Print initial data? (y / n): ");
                            string ans = Console.ReadLine();
                            if (ans == "y")
                            {
                                Console.Write("A: ");
                                printMatrix(A);
                                Console.WriteLine();
                                Console.Write("b: ");
                                printArray(b);
                                Console.WriteLine();
                                Console.Write("c: ");
                                printArray(c);
                                Console.WriteLine();
                            }
                            simplex(n, n, ref A, ref b, ref c, out float[] x, out float z);
                            printResults(x);
                            Console.WriteLine("z: " + z);
                            Console.ReadLine();
                            break;
                        }
                    case 6:
                        {
                            testSimplex(20, 10);
                            break;
                        }
                }
            }    
        }

        static void genRandomSimplex(int n, int m, out float[,] A, out float[] b, out float[] c)
        {
            A = new float[n + m, n + m];
            b = new float[n + m];
            c = new float[n + m];
            Random r = new Random();
            for(int i = n; i < n + m; i++)
            {
                for(int j = 0; j < m; j++)
                {
                    A[i, j] = r.Next(1, 1000);
                }
            }

            for(int i = n; i < n + m; i++)
            {
                b[i] = r.Next(1, 1000);
            }

            for (int i = 0; i < n; i++)
            {
                c[i] = r.Next(1, 1000);
            }
        }

        static void testSimplex(int max_vel_problema, int st_ponovitev)
        {
            createFile("testSimplex.txt");
            writeToFile("testSimplex.txt", "n:\tmin:\tmid:\tmax:\n");
            for (int n = 2; n <= max_vel_problema; n++)
            {
                List<double> merjenja = new List<double>();
                for (int i = 0; i < st_ponovitev; i++)
                {
                    //Ustvari nakljucno matriko A in vektorja b in c
                    genRandomSimplex(n, n, out float[,] A, out float[] b, out float[] c);
                    var watch = System.Diagnostics.Stopwatch.StartNew();
                    simplex(n, n, ref A, ref b, ref c, out float[] x, out float z);
                    watch.Stop();
                    double elapsedS = watch.Elapsed.TotalSeconds;
                    merjenja.Add(elapsedS);
                }
                merjenja.Sort();
                double min = merjenja[0];
                double mid = merjenja[(int)(merjenja.Count - 1) / 2];
                double max = merjenja[merjenja.Count - 1];
                writeToFile("testSimplex.txt", n + "\t" + min.ToString().Replace(',', '.') + "\t" + mid.ToString().Replace(',', '.') + "\t" + max.ToString().Replace(',', '.') + "\n");
            }
        }

        static void simplex(int n, int m, ref float[,] A, ref float[] b, ref float[] c, out float[] x, out float z) //A, b ,c
        {
            x = new float[n + m];
            z = 0;
            initializeSimplex(n, m, A, b, c, out int[] B, out int[] N, out float v);
            if (v == -1)
            {
                Console.WriteLine("Init simplex fail");
                return;
            }

            while(checkC(c, N)) //Če obstaja Ck > 0, k element N
            {
                //Izberi e  N, tako da velja Ce > 0;
                int e = chooseE(c, N);
                if (e == -1)
                {
                    Console.WriteLine("Can't choose 'e'");
                    return;
                }
                float[] delta = new float[n + m]; //TODO preveri length n + m
                //Izračunaj delte za indekse v B.
                foreach (int j in B) 
                {
                    if(A[j, e] > 0)
                    {
                        delta[j] = b[j] / A[j, e];
                    }
                    else
                    {
                        delta[j] = float.MaxValue;
                    }
                }       
                int l = -1;
                float delta_min = float.MaxValue;
                //Najdi delta_min
                foreach (int i in B)
                {
                    if(delta[i] < delta_min) { delta_min = delta[i]; l = i; }
                }
                if(delta[l] == float.MaxValue)
                {
                    Console.WriteLine("Neomejen program.");
                    return;
                }
                else
                {
                    pivot(ref A, ref b, ref c, ref N, ref B, ref v, l, e);
                }
            }

            
            for (int i = 0; i < x.Length; i++)
            {
                if (isElementInArray(i, B)) x[i] = b[i];
                else x[i] = 0;
            }
            z = v;           
        }

        static void pivot(ref float[,] A, ref float[] b, ref float[] c, ref int[] N, ref int[] B, ref float v, int l, int e) 
        {
            float[,] n_A = new float[A.GetLength(0), A.GetLength(1)];
            float[] n_b = new float[b.Length];
            float[] n_c = new float[c.Length];
            n_b[e] = b[l] / A[l, e];
            foreach(int j in N)
            {
                if (j == e) continue;
                n_A[e, j] = A[l, j] / A[l, e];
            }
            n_A[e, l] = (float)1 / A[l, e];
            foreach(int i in B)
            {
                if (i == l) continue;
                n_b[i] = b[i] - (A[i, e] * n_b[e]);
                foreach(int j in N)
                {
                    if (j == e) continue;
                    n_A[i, j] = A[i, j] - (A[i, e] * n_A[e, j]);
                }
                n_A[i, l] = (-1 * A[i, e]) * n_A[e, l];
            }

            float n_v = v + (c[e] * n_b[e]);
            foreach (int j in N)
            {
                if (j == e) continue;
                n_c[j] = c[j] - (c[e] * n_A[e, j]); 
            }
            n_c[l] = (-1 * c[e]) * n_A[e, l];
            int[] n_N = new int[N.Length];
            int[] n_B = new int[B.Length];
            int idx = 0;
            foreach(int _b in B)
            {
                if(_b != l)
                {
                    n_B[idx] = _b;
                    idx++;
                }
            }
            idx = 0;
            foreach (int _n in N)
            {
                if (_n != e)
                {
                    n_N[idx] = _n;
                    idx++;
                }
            }
            n_B[B.Length - 1] = e;
            n_N[N.Length - 1] = l;
            A = n_A; b = n_b; c = n_c; N = n_N; B = n_B; v = n_v;  
        }

        static void initializeSimplex(int n, int m, float[,] A, float[] b, float[] c, out int[] B, out int[] N, out float v)
        {
            float min = float.MaxValue;
            for (int i = 0; i < b.Length; i++)
            {
                if (b[i] < min)
                {
                    min = b[i];
                }

            }
            if (min >= 0)
            {
                N = new int[m];
                for (int i = 0; i < n; i++)
                {
                    N[i] = i;
                }
                B = new int[n];
                for (int i = n; i < n + m; i++)
                {
                    B[i - n] = i;
                }
                v = 0;
                return;
            }
            else
            {
                Console.WriteLine("Negativna vrednost v vektorju b.");
                B = null; N = null; v = -1;
                return;
            }
        }

        static bool isElementInArray(int n, int[] a)
        {
            foreach(int i in a)
            {
                if (n == i) return true;
            }
            return false;
        }

        static bool checkC(float[] c, int[] N)
        {
            foreach(int k in N)
            {
                if(c[k] > 0) //TODO preveri indeksiranje
                {
                    return true;
                }
            }
            return false;
        }

        static int chooseE(float[] c, int[] N)
        {
            foreach(int e in N)
            {
                if(c[e] > 0)
                {
                    return e;
                }
            }
            return -1;
        }

        //funkcije za menu printe
        #region menuFunctions

        static int printMenu()
        {
            Console.Clear();
            Console.WriteLine("Vaja 4 Simplex");
            Console.WriteLine("====================================");
            Console.WriteLine("1. testOsnovniSimpex.txt");
            Console.WriteLine("2. testSimplex2.txt");
            Console.WriteLine("3. simplexTezko.txt");
            Console.WriteLine("4. testNedelujocSimplex.txt");
            Console.WriteLine("5. random simplex");
            Console.WriteLine("6. random simplex time tests");
            Console.WriteLine("0. Exit");
            Console.WriteLine("====================================");
            Console.Write("Choose a number: ");

            return Convert.ToInt32(Console.ReadLine());
        }

        #endregion

        //Funckije za print array in matrix
        #region printFunctions
        static void printArray(int[] a)
        {
            Console.WriteLine();
            foreach (int d in a)
            {
                Console.Write(d + " ");
            }
            Console.WriteLine();
        }

        static void printArray(float[] a)
        {
            Console.WriteLine();
            foreach (float d in a)
            {
                Console.Write(d + " ");
            }
            Console.WriteLine();
        }

        static void printResults(float[] x)
        {
            int i = 1;
            foreach (float f in x)
            {
                Console.Write("x" + i + ": " + f);
                i++;
                Console.WriteLine();
            }           
        }

        static void printMatrix(float[,] m)
        {
            int rows = m.GetLength(0);
            int cols = m.GetLength(1);

            Console.WriteLine();

            for (int i = 0; i < rows; i++)
            {
                for(int j = 0; j < cols; j++)
                {
                    Console.Write(m[i, j] + " ");
                }
                Console.WriteLine();
            }
        }
        #endregion

        static void readSimplexFromFile(string fileName, out int n, out int m, out float[,] A, out float[] b, out float[] c)
        {
            var lines = File.ReadAllLines(fileName);
            n = Convert.ToInt32((lines[0].Split(' '))[0]);
            m = Convert.ToInt32((lines[0].Split(' '))[1]);
            A = new float[n + m, n + m];
            b = new float[n + m];
            c = new float[n + m];

            for(int i = 2; i < 2 + n + m; i++)
            {
                string[] line = lines[i].Split(' ');
                for(int j = 0; j < line.Length; j++)
                {
                    A[i - 2, j] = float.Parse((line[j]));
                }
            }

            string[] line_b = lines[2 + n + m + 1].Split(' ');
            for(int i = 0; i < line_b.Length; i++)
            {
                b[i] = float.Parse((line_b[i]));
            }

            string[] line_c = lines[2 + n + m + 3].Split(' ');
            for (int i = 0; i < line_b.Length; i++)
            {
                c[i] = float.Parse((line_c[i]));
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
    }
}
