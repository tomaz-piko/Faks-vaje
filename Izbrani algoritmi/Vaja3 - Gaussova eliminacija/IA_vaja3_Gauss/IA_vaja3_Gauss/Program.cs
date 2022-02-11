using System;
using System.IO;
using System.Collections.Generic;

namespace IA_vaja3_Gauss
{
    class Program
    {
        static string curr_method = "float";
        static string curr_file = "test.txt";

        static void Main(string[] args)
        {
            bool running = true;
            while (running)
            {
                int key = printMenu();
                switch (key)
                {
                    case 1:
                        if (curr_method == "float") curr_method = "double";
                        else if (curr_method == "double") curr_method = "float";
                        break;
                    case 2:                 
                        printFiles();
                        break;
                    case 3: //
                        int n = 0;
                        if(curr_method == "float")
                        {
                            float[,] a = readGaussFileFloat(ref n, curr_file);
                            printMatrix(a, n);
                            var watch = System.Diagnostics.Stopwatch.StartNew();
                            float[] results = GaussElimination(a, n);
                            watch.Stop();
                            var elapsedS = watch.Elapsed.TotalSeconds;
                            if (results.Length > 1)
                            {
                                printResults(results);
                                Console.WriteLine("Gauss completed in : " + elapsedS.ToString() + " s");
                            }
                        }
                        else
                        {
                            double[,] a = readGaussFileDouble(ref n, curr_file);
                            printMatrix(a, n);
                            var watch = System.Diagnostics.Stopwatch.StartNew();
                            double[] results = GaussElimination(a, n);
                            watch.Stop();
                            var elapsedS = watch.Elapsed.TotalSeconds;
                            if (results.Length > 1)
                            {
                                printResults(results);
                                Console.WriteLine("Gauss completed in : " + elapsedS.ToString() + " s");
                            }
                        }
                        Console.ReadLine();
                        break;
                    case 4: //Input n and create random matrix and solve with gaus.
                        {
                            Console.Write("Input n: ");
                            n = Convert.ToInt32(Console.ReadLine());
                            if (curr_method == "float")
                            {
                                float[,] a = createRandomMatrixFloat(n);
                                printMatrix(a, n);
                                var watch = System.Diagnostics.Stopwatch.StartNew();
                                float[] results = GaussElimination(a, n);
                                watch.Stop();
                                var elapsedS = watch.Elapsed.TotalSeconds;
                                if (results.Length > 1)
                                {
                                    printResults(results);
                                    Console.WriteLine("Gauss completed in : " + elapsedS.ToString() + " s");
                                }
                            }
                            else
                            {
                                double[,] a = createRandomMatrixDouble(n);
                                printMatrix(a, n);
                                var watch = System.Diagnostics.Stopwatch.StartNew();
                                double[] results = GaussElimination(a, n);
                                watch.Stop();
                                var elapsedS = watch.Elapsed.TotalSeconds;
                                if(results.Length > 1)
                                {
                                    printResults(results);
                                    Console.WriteLine("Gauss completed in : " + elapsedS.ToString() + " s");
                                }                               
                            }
                            Console.ReadLine();
                            break;
                        }
                    case 5: //Test časovne zahtevnosti glede na velikost random matrike (za n od 3 do 30 ).
                        {
                            string fileName = "randTest_" + curr_method + ".txt";
                            createFile(fileName);
                            writeToFile(fileName, "n:\ts:\n");
                            for(int n0 = 3; n0 <= 100; n0++)
                            {
                                List<double> timeResults = runRandomMatrixTests(curr_method, n0, 20);
                                double avg = 0;
                                foreach (double tr in timeResults)
                                {
                                    avg += tr;
                                }
                                avg /= timeResults.Count;
                                writeToFile(fileName, n0 + "\t" + avg.ToString().Replace(',', '.') + "\n");
                            }
                            Console.WriteLine("Tests finished. Saved as " + fileName + ".");                                                                                 
                            Console.ReadLine();
                            break;
                        }
                    case 6:
                        {
                            int n0 = 0;
                            float[,] a = readGaussFileFloat(ref n0, "test2.txt");
                            Console.Clear();
                            Console.WriteLine("Matrix:");
                            printMatrix(a, n0);
                            Console.WriteLine();
                            Console.WriteLine("=====================================================");
                            List<double> timeResultsFloat = new List<double>();
                            float[] resultsFloat = new float[n0];
                            double avgFloat = 0;
                            for(int i = 0; i < 20; i++)
                            {
                                var watch = System.Diagnostics.Stopwatch.StartNew();
                                resultsFloat = GaussElimination(a, n0);
                                watch.Stop();
                                var elapsedS = watch.Elapsed.TotalSeconds;
                                timeResultsFloat.Add(elapsedS);
                                
                            }
                            foreach (double tr in timeResultsFloat)
                            {
                                avgFloat += tr;
                            }
                            Console.WriteLine("RESULTS WITH FLOAT:");
                            avgFloat /= timeResultsFloat.Count;
                            printResults(resultsFloat);
                            Console.WriteLine("Gauss finished in avg: " + avgFloat + " s.");

                            Console.WriteLine("=====================================================");

                            double[,] b = readGaussFileDouble(ref n0, "test2.txt");
                            List<double> timeResultsDouble = new List<double>();
                            double[] resultsDouble = new double[n0];
                            double avgDouble = 0;
                            for (int i = 0; i < 20; i++)
                            {
                                var watch = System.Diagnostics.Stopwatch.StartNew();
                                resultsDouble = GaussElimination(b, n0);
                                watch.Stop();
                                var elapsedS = watch.Elapsed.TotalSeconds;
                                timeResultsDouble.Add(elapsedS);
                            }
                            foreach (double tr in timeResultsDouble)
                            {
                                avgDouble += tr;
                            }
                            Console.WriteLine("RESULTS WITH DOUBLE:");
                            avgDouble /= timeResultsDouble.Count;
                            printResults(resultsDouble);
                            Console.WriteLine("Gauss finished in avg: " + avgDouble + " s.");
                            writeToFile("test2_resultsLog.txt", avgFloat.ToString().Replace(',', '.') + "\t" + avgDouble.ToString().Replace(',', '.') + "\n");
                            Console.ReadLine();
                            break;
                        }
                    case 0:
                        running = false;
                        break;
                }
            }
        }

        static List<double> runRandomMatrixTests(string method, int n, int runs)
        {
            List<double> timeResults = new List<double>();
            for(int i = 0; i < runs; i++)
            {
                if (method == "float")
                {
                    float[,] a = createRandomMatrixFloat(n);
                    var watch = System.Diagnostics.Stopwatch.StartNew();
                    float[] results = GaussElimination(a, n);
                    watch.Stop();
                    var elapsedS = watch.Elapsed.TotalSeconds;
                    timeResults.Add(elapsedS);
                }
                else if (method == "double")
                {
                    double[,] a = createRandomMatrixDouble(n);
                    var watch = System.Diagnostics.Stopwatch.StartNew();
                    double[] results = GaussElimination(a, n);
                    watch.Stop();
                    var elapsedS = watch.Elapsed.TotalSeconds;
                    timeResults.Add(elapsedS);
                }
            }
            return timeResults;
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

        static double[,] createRandomMatrixDouble(int n)
        {
            Random r = new Random();
            double[,] a = new double[n, n + 1];
            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < n + 1; j++)
                {
                    int rand = r.Next(-20, 20);
                    a[i, j] = (double)rand;
                }
            }
            return a;
        }

        static float[,] createRandomMatrixFloat(int n)
        {
            Random r = new Random();
            float[,] a = new float[n, n + 1];
            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < n + 1; j++)
                {
                    int rand = r.Next(-20, 20);
                    a[i, j] = (float)rand;
                }
            }
            return a;
        }

        static int printMenu()
        {
            Console.Clear();
            Console.WriteLine("Vaja 2 RSA-encoding-decoding");
            Console.WriteLine("====================================");
            Console.WriteLine("1. Switch current method float/double.");
            Console.WriteLine("2. Switch current file.");
            Console.WriteLine("3. Solve matrix from file.");
            Console.WriteLine("4. Solve random matrix.");
            Console.WriteLine("5. Test time complexity on random matrices.");
            Console.WriteLine("6. Test time complexity on test2.txt");
            Console.WriteLine("0. Exit");
            Console.WriteLine("====================================");
            Console.WriteLine("CURRENT METHOD: " + curr_method);
            Console.WriteLine("CURRENT FILE: " + curr_file);
            Console.Write("Choose a number: ");

            return Convert.ToInt32(Console.ReadLine());
        }

        static void printFiles()
        {
            Console.Clear();
            Console.WriteLine("Possible files:");
            Console.WriteLine("====================================");
            Console.WriteLine("1. test.txt");
            Console.WriteLine("2. test2.txt");
            Console.WriteLine("3. problem1Gaus.txt");
            Console.WriteLine("4. problem2Gaus.txt");
            Console.WriteLine("5. neresljivo.txt");
            Console.WriteLine("6. neresljivo2.txt");
            Console.WriteLine("====================================");
            Console.WriteLine("CURRENT FILE: " + curr_file);
            Console.Write("Choose a number: ");
            int num = Convert.ToInt32(Console.ReadLine());
            switch(num)
            {
                case 1:
                    curr_file = "test.txt";
                    break;
                case 2:
                    curr_file = "test2.txt";
                    break;
                case 3:
                    curr_file = "problem1Gaus.txt";
                    break;
                case 4:
                    curr_file = "problem2Gaus.txt";
                    break;
                case 5:
                    curr_file = "neresljivo.txt";
                    break;
                case 6:
                    curr_file = "neresljivo2.txt";
                    break;
            }
        }

        static void printResults(double[] r)
        {
            Console.WriteLine();
            for (int i = 0; i < r.Length; i++)
            {
                Console.WriteLine("x" + (i+1).ToString() + " = " + r[i].ToString());
            }
        }

        static void printResults(float[] r)
        {
            Console.WriteLine();
            for (int i = 0; i < r.Length; i++)
            {
                Console.WriteLine("x" + (i+1).ToString() + " = " + r[i].ToString());
            }
        }

        static double[,] readGaussFileDouble(ref int n, string fileName)
        {
            var lines = File.ReadAllLines(@fileName);
            n = Convert.ToInt32(lines[0]);
            double[,] a = new double[n, n + 1];
            for (int i = 1; i < lines.Length; i++)
            {
                string[] nums = lines[i].Split(' ');
                for(int j = 0; j < nums.Length; j++)
                {
                    a[i - 1, j] = Convert.ToDouble(nums[j]);
                }
            }
            return a;
        }

        static float[,] readGaussFileFloat(ref int n, string fileName)
        {
            var lines = File.ReadAllLines(@fileName);
            n = Convert.ToInt32(lines[0]);
            float[,] a = new float[n, n + 1];
            for (int i = 1; i < lines.Length; i++)
            {
                string[] nums = lines[i].Split(' ');
                for (int j = 0; j < nums.Length; j++)
                {
                    a[i - 1, j] = float.Parse(nums[j]);
                }
            }
            return a;
        }

        static double[] GaussElimination(double[,] a, int n)
        {
            double[] error = { 0 };
            for (int k = 0; k < n - 1; k++)
            {
                //Poišči najmanjši člen
                double min = double.MaxValue;
                int[] pos = { -1, -1 };
                for(int j = k; j < n; j++)
                {
                    double tmp = a[j, k];
                    if (Math.Abs(tmp) != 0 && Math.Abs(tmp) < min)
                    {
                        pos[0] = j;
                        pos[1] = k;
                        min = Math.Abs(tmp);
                    }
                }          
                if (pos[0] == -1 || pos[1] == -1 || min == 0) { 
                    Console.WriteLine("ERROR: Najmanjši neničelni člen ni bil najden.");
                    printMatrix(a, n);
                    return error;
                }
                else
                {
                    if (pos[0] != pos[1])
                    {
                        a = SwitchRows(a, k, pos[0], n);
                    }
                }
                for (int l = k + 1; l < n; l++)
                {
                    double koef = a[l, k] / a[k, k];
                    for (int i = k; i < n + 1; i++) //Od leve proti desni
                    {
                        a[l, i] -= a[k, i] * koef; //Odštej od vrstice l vrstico k, pomnoženo z a1k.              
                    }
                }
                
            }
            if(a[n-1, n-1] == 0) {
                Console.WriteLine("ERROR: Nedovoljeni ničelni element na a[" + (n - 1) + ", " + (n - 1) + "].");
                printMatrix(a, n);
                return error; }

            double[] results = new double[n];
            results[n - 1] = (double)a[n - 1, n] / (double)a[n - 1, n - 1];
            for (int i = n-2; i >= 0; i--)
            {
                double res = 0;
                for(int j = i; j < n; j++)
                {
                    res += a[i, j] * results[j];
                }
                results[i] = (1 / (double)a[i, i]) * (a[i, n] - res);
            }
            return results;
        }

        static float[] GaussElimination(float[,] a, int n)
        {
            float[] error = { 0 };
            for (int k = 0; k < n - 1; k++)
            {
                //Poišči najmanjši člen
                float min = float.MaxValue;
                int[] pos = { -1, -1 };
                for (int j = k; j < n; j++)
                {
                    float tmp = a[j, k];
                    if (Math.Abs(tmp) != 0 && Math.Abs(tmp) < min)
                    {
                        pos[0] = j;
                        pos[1] = k;
                        min = Math.Abs(tmp);
                    }
                }
                if (pos[0] == -1 || pos[1] == -1 || min == 0)
                {
                    Console.WriteLine("ERROR: Najmanjši neničelni člen ni bil najden.");
                    printMatrix(a, n);
                    return error;
                }
                else
                {
                    if(pos[0] != pos[1])
                    {
                        a = SwitchRows(a, k, pos[0], n);
                    }                
                }
                for (int l = k + 1; l < n; l++)
                {
                    float koef = a[l, k] / a[k, k];
                    for (int i = k; i < n + 1; i++) //Od leve proti desni
                    {
                        a[l, i] -= a[k, i] * koef; //Odštej od vrstice l vrstico k, pomnoženo z a1k.              
                    }
                }
            }
            if (a[n - 1, n - 1] == 0)
            {
                Console.WriteLine("ERROR: Nedovoljeni ničelni element na a[" + (n-1) + ", " + (n-1) + "].");
                printMatrix(a, n);
                return error;
            }

            float[] results = new float[n];
            results[n - 1] = (float)a[n - 1, n] / (float)a[n - 1, n - 1];
            for (int i = n - 2; i >= 0; i--)
            {
                float res = 0;
                for (int j = i; j < n; j++)
                {
                    res += a[i, j] * results[j];
                }
                results[i] = (1 / (float)a[i, i]) * (a[i, n] - res);
            }
            return results;           
        }

        static double[,] SwitchRows(double[,] a, int x, int y, int n)
        {
            double[,] tmp = (double[,])a.Clone();
            for (int i = 0; i < n + 1; i++)
            {
                tmp[x, i] = a[y, i];
                tmp[y, i] = a[x, i];
            }
            return tmp;
        }

        static float[,] SwitchRows(float[,] a, int x, int y, int n)
        {
            float[,] tmp = (float[,])a.Clone();
            for (int i = 0; i < n + 1; i++)
            {
                tmp[x, i] = a[y, i];
                tmp[y, i] = a[x, i];
            }
            return tmp;
        }

        static void printMatrix(double[,] a, int n)
        {
            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < n + 1; j++)
                {
                    Console.Write(a[i, j] + " ");
                }
                Console.WriteLine();
            }
        }

        static void printMatrix(float[,] a, int n)
        {
            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < n + 1; j++)
                {
                    Console.Write(a[i, j] + " ");
                }
                Console.WriteLine();
            }
        }

    }
}
