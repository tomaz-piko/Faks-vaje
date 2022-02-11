using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace IA_vaja6_Drevesa
{

    class Node
    {
        public int Key { get; set; }
        public Node Parent { get; set; }
        public Node Left { get; set; }
        public Node Right { get; set; }
        public string Color { get; set; }

        public Node()
        {
            Key = 0;
            Parent = null;
            Left = null;
            Right = null;
            Color = "BLACK";
        }

        public Node(int key)
        {
            Key = key;
            Parent = null;
            Left = null;
            Right = null;
            Color = "BLACK";
        }     

        public override string ToString()
        {
            string s = "";
            //PRINT VARIANTA 1
            /*s += "Key: " + Key + "\n";
            s += "Color: " + Color + "\n";
            if (Left != null) s += "Left: Node\n";
            else s += "Left: null\n";
            if (Right != null) s += "Right: Node\n";
            else s += "Right: null\n";*/

            //PRINT VARIANTA 2
            /*if(Parent != null) 
            { 
                if(Parent.Color == "BLACK")
                {
                    s += Parent + "(B) -> ";
                }
                else {
                    s += Parent + "(R) -> ";
                }
                s += Key;
                if (Color == "BLACK") s += " (B)";
                else s += " (R)";
            }
            else
            {
                s += Key;
            }*/
            s += Key;
            if (Color == "BLACK") s += " (B)";
            else s += " (R)";
            if (Left == null) s += " - ";
            else s += "  ";
            if (Right == null) s += "-";

            return s;
        }

        public void Delete()
        {
            if(Parent != null)
            {
                if (Parent.Left != null && Parent.Left.Key == 0)
                {
                    Parent.Left = null;
                }
                else //if(Key == Parent.Right.Key)
                {
                    Parent.Right = null;
                }
            }          
        }
    }

    class Tree
    {
        public Node Root { get; set; }

        public Tree(int firstKey)
        {
            Root = new Node();
            Root.Key = firstKey;
        }

        public Tree(Node firstElement)
        {
            //Root = new Node();
            Root = firstElement;
        }

        public Node Find(int k)
        {
            Node x = Root;
            while(x != null && k != x.Key)
            {
                if (k < x.Key) x = x.Left;
                else x = x.Right;
            }
            return x;
        }

        public bool Add(int k) //VSTAVI(T, k) T = korensko vozlišče, k = stevilo, ki ga dodajamo
        {
            Node y = null;
            Node x = Root;

            while (x != null)
            {
                y = x;
                if (k < x.Key) x = x.Left;
                else if (k > x.Key) x = x.Right;
                else
                {
                    Console.WriteLine("Error1: " + k);
                    return false;
                }
            }
            Node z = new Node(k);
            z.Parent = y;
            z.Color = "RED";
            if (y == null)
            {
                Root = z;
            }
            else
            {
                if (z.Key < y.Key) y.Left = z;
                else y.Right = z;
            }
            RB_Insert_Fix(z);
            return true;
        }

        public bool Remove(int k)
        {
            Node z = Find(k);
            if(z == null)
            {
                Console.WriteLine("Tree does not contain element with key: " + k);
                return false;
            }
            if(z.Parent == null && z.Left == null && z.Right == null)
            {
                Console.WriteLine("Removing the only remaining element will delete the tree."); //Težave z ponovno inicialzacijo v main while zanki. Nerodna koda.
                return false;
            }
            Node x;
            string c;
            if(z.Left == null || z.Right == null)
            {
                c = z.Color;
                x = Link_To_Only_Son(z);
                if(x == null && z.Parent != null)
                {
                    x = new Node();
                    x.Parent = z.Parent;
                    if (x.Parent.Left == null)
                        x.Parent.Left = x;
                    else
                        x.Parent.Right = x;
                }
            }
            else
            {
                Node y = Successor(z);
                c = y.Color;
                int key = y.Key;
                x = Link_To_Only_Son(y);

                z.Key = key;
            }

            if(c == "BLACK")
            {
                RB_Remove_Fix(x);
            }
            if (x.Key == 0)
                x.Delete();

            return true;
        }

        private bool RB_Remove_Fix(Node x)
        {
            while (x != Root && x.Color == "BLACK") //ORG
            //while (x.Parent != null && x.Color == "BLACK")
            {               
                if(x == x.Parent.Left)
                {
                    Node w = x.Parent.Right;
                    if(w.Color == "RED")
                    {
                        w.Color = "BLACK";
                        x.Parent.Color = "RED";
                        Left_Rotate(x.Parent);
                        w = x.Parent.Right;
                    }
                    if ((w.Left == null || w.Left.Color == "BLACK") && (w.Right == null || w.Right.Color == "BLACK")) //Scenarij 2
                    {
                        w.Color = "RED";
                        x = x.Parent;
                    }
                    else
                    {
                        if (w.Left == null || w.Left.Color == "BLACK")
                        {
                            w.Left.Color = "BLACK";
                            w.Color = "RED";
                            Right_Rotate(w);
                            w = x.Parent.Right;
                        }
                        w.Color = x.Parent.Color;
                        x.Parent.Color = "BLACK";
                        w.Right.Color = "BLACK";
                        Left_Rotate(x.Parent);
                        x = Root;
                    }                   
                }
                else //if(x.Parent != null) //Moja koda for whatever reason
                {
                    Node w = x.Parent.Left;
                    if (w.Color == "RED") //Scenarij 1
                    {
                        w.Color = "BLACK";
                        x.Parent.Color = "RED";
                        Right_Rotate(x.Parent);
                        w = x.Parent.Left;
                    }
                    if ((w.Left == null || w.Left.Color == "BLACK") && (w.Right == null || w.Right.Color == "BLACK"))
                    {
                        w.Color = "RED";
                        x = x.Parent;
                    }
                    else
                    {
                        if (w.Left == null || w.Left.Color == "BLACK")
                        {
                            w.Right.Color = "BLACK";
                            w.Color = "RED";
                            Left_Rotate(w);
                            w = x.Parent.Left;
                        }
                        w.Color = x.Parent.Color;
                        x.Parent.Color = "BLACK";
                        w.Left.Color = "BLACK";
                        Right_Rotate(x.Parent);
                        x = Root;
                    }
                }
            }
            x.Color = "BLACK";
            return true;
        }

        private Node Successor(Node x)
        {
            if(x.Right != null)
            {
                x = x.Right;
                while(x.Left != null)
                {
                    x = x.Left;
                }
                return x;
            }
            else
            {
                Node y = x.Parent;
                while(y != null && x == y.Right)
                {
                    x = y;
                    y = y.Parent;
                }
                return y;
            }
        }

        private Node Link_To_Only_Son(Node y) //y = brisani element
        {
            Node x;
            if (y.Left != null) 
                x = y.Left;
            else 
                x = y.Right;

            if (x != null) 
                x.Parent = y.Parent;

            if (y.Parent == null) 
                Root = x;
            else
            {
                if (y == y.Parent.Left)
                    y.Parent.Left = x;
                else
                    y.Parent.Right = x;
            }
            //y.Delete();
            return x;
        }

        private bool RB_Insert_Fix(Node z)
        {
            while(z.Parent != null && z.Parent.Color == "RED")
            {
                if(z.Parent == z.Parent.Parent.Left)
                {
                    Node y = z.Parent.Parent.Right;
                    if(y != null && y.Color == "RED") 
                    {
                        z.Parent.Color = "BLACK";
                        y.Color = "BLACK";
                        z.Parent.Parent.Color = "RED";
                        z = z.Parent.Parent;
                    }
                    else
                    {
                        if(z == z.Parent.Right)
                        {
                            z = z.Parent;
                            Left_Rotate(z);
                        }
                        z.Parent.Color = "BLACK";
                        z.Parent.Parent.Color = "RED";
                        Right_Rotate(z.Parent.Parent);
                    }
                }
                else //Isto samo zamenjaj levo desno
                {
                    Node y = z.Parent.Parent.Left;
                    if (y != null && y.Color == "RED")
                    {
                        z.Parent.Color = "BLACK";
                        y.Color = "BLACK";
                        z.Parent.Parent.Color = "RED";
                        z = z.Parent.Parent;
                    }
                    else
                    {
                        if (z == z.Parent.Left)
                        {
                            z = z.Parent;
                            Right_Rotate(z);
                        }
                        z.Parent.Color = "BLACK";
                        z.Parent.Parent.Color = "RED";
                        Left_Rotate(z.Parent.Parent);
                    }
                }
            }
            Root.Color = "BLACK";
            return true;
        }

        private void Left_Rotate(Node x)
        {
            Node y = x.Right;
            x.Right = y.Left;
            if (y.Left != null) y.Left.Parent = x;
            y.Parent = x.Parent;
            if (x.Parent == null) Root = y;
            else if (x == x.Parent.Left) x.Parent.Left = y;
            else x.Parent.Right = y;
            y.Left = x;
            x.Parent = y;
        }

        private void Right_Rotate(Node x) //Simetričen Left_Rotate,... whatever that means
        {
            Node y = x.Left;
            x.Left = y.Right;
            if (y.Right != null) y.Right.Parent = x;
            y.Parent = x.Parent;
            if (x.Parent == null) Root = y;
            else if (x == x.Parent.Left) x.Parent.Left = y;
            else x.Parent.Right = y;
            y.Right = x;
            x.Parent = y;
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            bool running = true;
            Tree tree = null;
    
            while(running)
            {
                Console.Clear();
                if(tree != null)
                {
                    printTree(tree.Root);
                    Console.WriteLine();
                }
                    
                int key = printMenu();
                switch(key)
                {
                    case 1:
                        {
                            Console.Write("(Add) Input key: ");
                            int k = Convert.ToInt32(Console.ReadLine());
                            if (tree == null) tree = new Tree(k);
                            else tree.Add(k);
                            break;
                        }
                    case 2:
                        {
                            Console.Write("(Del) Input key: ");
                            int k = Convert.ToInt32(Console.ReadLine());
                            tree.Remove(k);
                            break;
                        }
                    case 3:
                        {
                            tree = ReadFileToTree("vhod.txt");
                            break;
                        }
                    case 4:
                        {
                            tree = null;
                            break;
                        }
                    case 0:
                        running = false;
                        break;
                }
            }
        }

        static void printTree(Node n)
        {
            if(n != null)
            {
                Console.WriteLine(n.ToString());
                printTree(n.Left);
                printTree(n.Right);
            }
        }

        static int printMenu()
        {
            Console.WriteLine("Vaja 6. RB-drevesa");
            Console.WriteLine("============================");
            Console.WriteLine("1.) Insert key into Tree.");
            Console.WriteLine("2.) Delete key from Tree.");
            Console.WriteLine("3.) Read Tree from file.");
            Console.WriteLine("4.) Reset Tree.");
            Console.WriteLine("0.) Exit.");
            Console.WriteLine("============================");
            Console.Write("Enter value: ");
            return Convert.ToInt32(Console.ReadLine());
        }

        static Tree ReadFileToTree(string filePath)
        {           
            var lines = File.ReadAllLines(filePath);
            string[] values = lines[0].Split(' ');
            Tree tree = new Tree(Convert.ToInt32(values[0]));

            for(int i = 1; i < values.Length; i++) 
            {
                int k = Convert.ToInt32(values[i]);
                tree.Add(k);
            }
            return tree;
        }
    }
}
