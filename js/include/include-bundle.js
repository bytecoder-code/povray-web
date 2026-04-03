// POV-Ray Web - Bundled standard include files
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Auto-generated from references/povray/distribution/include/
// Generated: 2026-04-01T22:29:46.524Z

export const STANDARD_INCLUDES = {
    'arrays.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

// Persistence of Vision Ray Tracer version 3.5 Include File
// File: arrays.inc
// Last updated: May 7 2002
// Description: Array manipulation macros...sorting, resizing, etc.

#ifndef(ARRAYS_INC_TEMP)
#declare ARRAYS_INC_TEMP = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
   #debug "including arrays.inc\\n"
#end

// Input:  a one dimensional array and a random stream
// Output: a random item from the input array
// Source: variate.inc by Ingo Janssen
#macro Rand_Array_Item(Array, Stream)
   #if(dimensions(Array)=1)
      Array[floor(rand(Stream)*0.9999999*dimension_size(Array,1))]
   #else
      #error "The Rand_Array_Item() macro only works for 1D arrays."
   #end
#end


#macro Resize_Array(Array, NewSize)
   #if(dimensions(Array)=1)
      #local NewArray = array[NewSize]
      #local C = 0;
      #local Max = min(NewSize, dimension_size(Array, 1));
      #while (C < Max)
         #ifdef (Array[C])
            #local NewArray[C] = Array[C];
         #end
         #local C = C + 1;
      #end
      #declare Array = NewArray
   #else
      #error "The Resize_Array() macro only works for 1D arrays."
   #end
#end


#macro Reverse_Array(Array)
   #if(dimensions(Array)=1)
      #local J = 0;
      #local N = dimension_size(Array, 1) - 1;
      #while(J < N/2)
         #local Temp = Array[J];
         #local Array[J] = Array[N-J];
         #local Array[N-J] = Temp;
         #local J = J + 1;
      #end
   #else
      #error "The Reverse_Array() macro only works for 1D arrays."
   #end
#end


// #macro Insert_In_Array(Item, DestArray, Index)
// #macro Insert_Array_In_Array(ItemArray, DestArray, Index)

// #macro Append_To_Array(Item, DestArray, Index)
// #macro Append_Array_To_Array(ItemArray, DestArray, Index)

// This macro will compare float values and vector lengths.
// It is intended to be redefined by the user to suit their
// needs, but it should always return true if A is "less than"
// B, otherwise false.
// #macro SortCompare(A, B) (vlength(A) < vlength(B)) #end
// #macro SortCompare(Array, IdxA, IdxB) (vlength(Array[IdxA]) < vlength(Array[IdxB])) #end
#macro Sort_Compare(Array, IdxA, IdxB) (Array[IdxA] < Array[IdxB]) #end

// This macro swaps the data in two locations. The user can
// redefine it, for example to swap additional data along a
// second dimension, keeping columns of data together.
#macro Sort_Swap_Data(Array, IdxA, IdxB)
   #local Tmp = Array[IdxA];
   #declare Array[IdxA] = Array[IdxB];
   #declare Array[IdxB] = Tmp;
#end


// Sort macros slightly modified from QuickSort macros by Juha Nieminen
#macro Sort_Array(Array)
   Sort_Partial_Array(Array, 0, dimension_size(Array, 1)-1)
#end

#macro Sort_Partial_Array(Array, FirstInd, LastInd)
   ARRAYS_HybridQuickSortStep(Array, FirstInd, LastInd)
   ARRAYS_InsertionSort(Array, FirstInd, LastInd)
#end

#declare ARRAYS_QuickSortSeed = seed(0);

#macro ARRAYS_HybridQuickSortStep(Array, FirstInd, LastInd)
   #local FInd = FirstInd;
   #while(FInd < LastInd-10)
      #local RInd = FInd + rand(ARRAYS_QuickSortSeed)*(LastInd - FInd);
      Sort_Swap_Data(Array, FInd, RInd)
      #local I = FInd-1;
      #local J = LastInd+1;
      #local Mid = -1;
      #while(Mid < 0)
         #local J = J-1;
         #while(Sort_Compare(Array, FInd, J)) #local J = J-1; #end
         #local I = I+1;
         #while(Sort_Compare(Array, I, FInd)) #local I = I+1; #end
         
         #if(I < J)
            Sort_Swap_Data(Array, I, J)
         #else
            #local Mid = J;
         #end
      #end
      ARRAYS_HybridQuickSortStep(Array, FInd, Mid)
      #local FInd = Mid+1;
   #end
#end

#macro ARRAYS_InsertionSort(Array, FirstInd, LastInd)
   #local Ind1 = FirstInd+1;
   #while(Ind1 <= LastInd)
      #local Ind2 = Ind1;
      #while(Ind2 > FirstInd)
         #local NextInd2 = Ind2-1;
         #if(Sort_Compare(Array, Ind2, NextInd2))
            Sort_Swap_Data(Array, Ind2, NextInd2)
            #local Ind2 = NextInd2;
         #else
            #local Ind2 = 0;
         #end
      #end
      #local Ind1 = Ind1+1;
   #end
#end

#macro ARRAYS_WriteDF3(Array, FileName, BitDepth)

  #switch (BitDepth)
  #case (8)
    #macro ARRAYS_Temp_WriteDF3(ArrayItem)
      #ifdef (ArrayItem)
        #write(ARRAYS_Temp_File, uint8 ArrayItem * 255)
      #else
        #write(ARRAYS_Temp_File, uint8 0)
      #end
    #end
  #break
  #case (16)
    #macro ARRAYS_Temp_WriteDF3(ArrayItem)
      #ifdef (ArrayItem)
        #write(ARRAYS_Temp_File, uint16be ArrayItem * 65535)
      #else
        #write(ARRAYS_Temp_File, uint16be 0)
      #end
    #end
  #break
  #else
    #error "ARRAYS_WriteDF3: bit depth not supported\\n"
  #end

  #switch (dimensions(Array))
  #case (1)
    #local SizeX = dimension_size(Array,1);
    #local SizeY = 1;
    #local SizeZ = 1;
    #macro ARRAYS_Temp(Arr,IX,IY,IZ) Arr[IX] #end
  #break
  #case (2)
    #local SizeX = dimension_size(Array,1);
    #local SizeY = dimension_size(Array,2);
    #local SizeZ = 1;
    #macro ARRAYS_Temp(Arr,IX,IY,IZ) Arr[IX][IY] #end
  #break
  #case (3)
    #local SizeX = dimension_size(Array,1);
    #local SizeY = dimension_size(Array,2);
    #local SizeZ = dimension_size(Array,3);
    #macro ARRAYS_Temp(Arr,IX,IY,IZ) Arr[IX][IY][IZ] #end
  #break
  #else
    #error "ARRAYS_WriteDF3: number of dimensions not supported\\n"
  #end

  #if ((SizeX > 65535) | (SizeY > 65535) | (SizeZ > 65535))
    #error "ARRAYS_WriteDF3: dimension size not supported\\n"
  #end
  #fopen ARRAYS_Temp_File FileName write
  #write (ARRAYS_Temp_File, uint16be <SizeX,SizeY,SizeZ>)
  #local IndZ = 0;
  #while (IndZ < SizeZ)
    #local IndY = 0;
    #while (IndY < SizeY)
      #local IndX = 0;
      #while (IndX < SizeX)
        ARRAYS_Temp_WriteDF3(ARRAYS_Temp(Array,IndX,IndY,IndZ))
        #local IndX = IndX + 1;
      #end
      #local IndY = IndY + 1;
    #end
    #local IndZ = IndZ + 1;
  #end
  #undef ARRAYS_Temp
  #undef ARRAYS_Temp_WriteDF3
  #fclose ARRAYS_Temp_File
#end

#version ARRAYS_INC_TEMP;
#end

`,
    'chars.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: chars.inc
//    Last updated: 2001.7.21
//    Description: This file contains letters as objects.

#ifndef(Chars_Inc_Temp)
#declare Chars_Inc_Temp=version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
#   debug "including chars.inc\\n"
#end

/*

		   Characters for POV-Ray Version 3.1
		     Original by Ken Maeno 1992-93
		  Revised and extended by Chris Young
	    Revised for internal web removal by John Andersen

 This file includes 26 upper-case letter and other characters defined
 as objects. The size of all characters is 4 * 5 * 1. The center of the
 bottom side of a character face is set to the origin, so please
 translate a character appropriately before rotating it about
 the x or z axes.

	Usage:

	object{
	  char_A
	  pigment{ color Red }
	}

*/

#declare char_A =
 intersection {
   box{<-2,0,-0.1>,<2,5,1.1>}
   union {
     box{<-0.5,-6,0>,<0.5,0,1> rotate  z*16.699 }
     box{<-0.5,-6,0>,<0.5,0,1> rotate -z*16.699 }
     box{<-1,  -4,0>,<1, -3,1> }
     translate y*5
   }
   bounded_by{ box { <-2,0,0>,<2,5,1> } }
 }

#declare char_P =
  union {
    difference{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5}
      plane{x,0}
      bounded_by{ box { <0,-1.5,0>, <1.5, 1.5, 1> } }
      translate<0.5, 3.5, 0>
    }
    box{ <-1.001, 4, 0>, <0.501, 5, 1> }
    box{ <-1.001, 2, 0>, <0.501, 3, 1> }
    box{ <-2, 0, 0>, <-1, 5, 1 > }
  }

#declare char_B =
  union {
    object{char_P}
    difference{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5}
      plane{x,0}
      bounded_by{ box { <0,-1.5,0>, <1.5, 1.5, 1> } }
      translate<0.5, 1.5, 0>
    }
    box{ <-1.001, 0, 0>, <0.501, 1, 1> }
  }

#declare char_C =
  union {
    difference{
      cylinder{0*z,z,2}
      cylinder{-z,2*z,1}
      plane{y,0}
      bounded_by{ box { <-2,0,0>, <2,2,1> } }
      translate 3*y
    }
    difference{
      cylinder{0*z,z,2}
      cylinder{-z,2*z,1}
      plane{-y,0}
      bounded_by{ box { <-2,-2,0>, <2,0,1> } }
      translate 2*y
    }
    box{ <-2,1.999,0>,<-1,3.001,1> }
  }

#declare char_D =
  union {
    difference{
      cylinder{0*z,z,2.5}
      cylinder{-z,2*z,1.5}
      plane{x,0}
      bounded_by{ box { <0,-2.5,0>, <2.5,2.5,1> } }
      translate <-0.5,2.5,0>
    }
    box{ <-1.001,4,0>,<-0.499,5,1> }
    box{ <-1.001,0,0>,<-0.499,1,1> }
    box{ <-2,0,0>,<-1,5,1> }
  }

#declare char_F =
  union {
    box{ <-2,0,0>,<-1,5,1> }
    box{ <-1.001,2,0>,<1.5,3,1> }
    box{ <-1.001,4,0>,<2,5,1> }
  }

#declare char_E =
  union {
    object{char_F}
    box{ <-1.001,0,0>,<2,1,1> }
  }

#declare char_G =
  union {
    object{char_C}
    box{ < 0,1.5,0>,<2,2.3,1> }
  }

#declare char_H =
  union {
    box{ <-2,0,0>,<-1,5,1> }
    box{ < 1,0,0>,< 2,5,1> }
    box{ <-1.001,2,0>,< 1.001,3,1> }
  }

#declare char_I =
  box{ <-0.5,0,0>,<0.5,5,1> }

#declare char_J =
  union {
    difference{
      cylinder{0*z,z,2}
      cylinder{-z,2*z,1}
      plane{-y,0}
      bounded_by{ box { <-2,-2,0>, <2,0,1> } }
      translate 2*y
    }
    box{ <1,1.999,0>,<2,5,1> }
  }

#declare char_K =
  union {
    intersection {
      union {
	box{ <0,-2,0>,<0.9,5,1> rotate z*45  translate x*0.7272 }
	box{ <0,-5,0>,<0.9,2,1> rotate -z*45 translate <0.7272,5,0> }
      }
      box { <-1,0,-0.1>,<2,5,1.1> }
      bounded_by{ box { <-2,0,0>,<2,5,1> } }
    }
    box { <-2,0,0>,<-1,5,1> }
  }

#declare char_L =
   union {
     box{ <-2,1,0>,<-1,5,1> }
     box{ <-2.001,0,0>,<2,1,1>	}
   }

#declare char_M =
  union {
    intersection{
      union {
	box{<-0.5,-1,0>,<0.5,5,1> rotate  z*26.5651}
	box{<-0.5,-1,0>,<0.5,5,1> rotate -z*26.5651}
      }
      box{<-1,0,-0.1>,<1,3,1.1>}
      bounded_by{box{<-2,0,0>,<2,4,1>}}
      translate y*2
    }
    box{ <-2,0,0>,<-1,5,1> }
    box{ < 1,0,0>,< 2,5,1> }
  }

#declare char_N =
  union {
    intersection{
      box{ <0,0,0>,<1,6,1> rotate z*32.5031 translate x}
      box{ <-1,0,-0.1>,<1,5,1.1> }
      bounded_by{box{ <-1,0,0>,<1,5,1> } }
    }
    box{ <-2,0,0>,<-1,5,1> }
    box{ <1,0,0>,<2,5,1> }
  }

#declare char_O =
  union {
    object {char_C}
    box{ <1,1.999,0>,<2,3.001,1> }
  }

#declare char_Q =
  union {
    object {char_O}
    box{ <0,0,0>,<1,2.2,1> rotate z*45 translate x*1.29289}
  }

#declare char_R =
  union {
    object {char_P}
    intersection {
      box{ <0,-2,0>,<1,5,1> rotate z*36.8699 translate x}
      box{ <-1,0,-0.1>,<2,2,1.1> }
      bounded_by{box{ <-1,0,0>,<2,2,1> }}
    }
  }

#declare char_S =
  union {
    intersection{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5 inverse}
      box{<0,0,-0.1>,<1.5,1.5,1.1>}
      bounded_by{ box { <0,0,0>, <1.5, 1.5, 1> } }
      translate <0.5,3.5,0>
    }
    difference{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5}
      plane{x,0}
      bounded_by{ box { <0,-1.5,0>, <1.5, 1.5, 1> } }
      translate<0.5, 1.5, 0>
    }
    intersection{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5 inverse}
      box{<-1.5,-1.5,-0.1>,<0,0,1.1>}
      bounded_by{ box { <-1.5,-1.5,0>, <0, 0, 1> } }
      translate <-0.5,1.5,0>
    }
    difference{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5}
      plane{-x,0}
      bounded_by{ box { <-1.5,-1.5,0>, <0, 1.5, 1> } }
      translate<-0.5, 3.5, 0>
    }
    box{ <-0.502,4,0>,<0.502,5,1> }
    box{ <-0.502,2,0>,<0.502,3,1> }
    box{ <-0.502,0,0>,<0.502,1,1> }
  }

#declare char_T =
  union{
    box{ <-0.5,0,0>,<0.5,4,1> }
    box{ <-2,  4,0>,<  2,5,1> }
  }

#declare char_U =
  union {
    object{char_J}
    box{ <-2,1.998,0>,<-1,5,1> }
  }

#declare char_V =
  intersection {
    box{<-2,0,-0.1>,<2,5,1.1>}
    union {
      box{<-0.5,-1,0>,<0.5,6,1> rotate	z*16.699 }
      box{<-0.5,-1,0>,<0.5,6,1> rotate -z*16.699 }
    }
   bounded_by{ box { <-2,0,0>,<2,5,1> } }
 }

#declare char_W =
  union {
    intersection{
      union {
	box{<-0.5,-5,0>,<0.5,0,1> rotate  z*26.5651}
	box{<-0.5,-5,0>,<0.5,0,1> rotate -z*26.5651}
	translate 3*y
      }
      box{<-1,0,-0.1>,<1,3,1.1>}
      bounded_by{box{<-1,0,0>,<2,3,1>}}
    }
    box{ <-2,0,0>,<-1,5,1> }
    box{ < 1,0,0>,< 2,5,1> }
  }

#declare char_X =
  intersection {
    box{<-2,0,-0.1>,<2,5,1.1>}
    union {
      box{<-0.5,-3.5,0>,<0.5,3.5,1> rotate  z*30.9}
      box{<-0.5,-3.5,0>,<0.5,3.5,1> rotate -z*30.9}
      translate 2.5*y
    }
    bounded_by{ box { <-2,0,0>,<2,5,1> } }
 }

#declare char_Y =
  union {
    intersection {
      box{<-2,2,-0.1>,<2,5,1.1>}
      union {
	box{<-0.5,0,0>,<0.5,3.5,1> rotate  z*30.9}
	box{<-0.5,0,0>,<0.5,3.5,1> rotate -z*30.9}
	translate 2.5*y
      }
      bounded_by{ box { <-2,2,0>,<2,5,1> } }
    }
    box {<-0.5,0,0>,<0.5,3,1>}
 }

#declare char_Z =
  union {
    intersection{
      box{ <0,0,0>,<1,7,1> rotate z*-29.6749 translate -2*x}
      box{<-2,0,-0.1>,<2,5,1.1>}
      bounded_by{ box { <-2,0,0>,<2,5,1> } }
    }
    box{ <-2,4,0>,<1.2,5,1> }
    box{ <-1.2,0,0>,<2,1,1> }
  }

#declare char_Dash =
   box{ <-2,2,0>,<2,3,1> }

#declare char_Plus =
   union{
     box{ <-2,2,0>,<2,3,1> }
     box{ <-0.5,0.5,0>,<0.5,4.5,1> }
   }

#declare char_0 = object{char_O}

#declare char_1 =
   union{
     object{char_I}
     box{ <0,-1.25,0>,<1,0,1> rotate -z*45 translate <-0.5,5,0>}
     box{ <-1,0,0>,<1,1,1> }
   }

#declare char_2 =
  union{
    intersection{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5 inverse}
      box{<-1.5,0,-0.1>,<0,1.5,1.1>}
      bounded_by{ box { <-1.5,0,0>, <0, 1.5, 1> } }
      translate<-0.5, 3.5, 0>
    }
    intersection{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5 inverse}
      plane{-x,0 }
      plane{-y,0 rotate -z*54 }
      bounded_by{ box { <0,-1.5,0>, <1.5, 1.5, 1> } }
      translate <0.5,3.5,0>
    }
    box{<-0.501,4,0>,<0.501,5,1>}
    box{<-2,0,0>,<2,1,1>}
    box{<-0.999,0.5,0>,<3.5,1.5,1> rotate -z*(90+54) translate <0.5,3.5,0>}
  }

#declare char_3 =
  union {
    intersection{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5 inverse}
      box{<-1.5,0,-0.1>,<0,1.5,1.1>}
      bounded_by{ box { <-1.5,0,0>, <0, 1.5, 1> } }
      translate<-0.5, 3.5, 0>
    }
    difference{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5}
      plane{x,0}
      bounded_by{ box { <0,-1.5,0>, <1.5, 1.5, 1> } }
      translate<0.5, 3.5, 0>
    }
    difference{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5}
      plane{x,0}
      bounded_by{ box { <0,-1.5,0>, <1.5, 1.5, 1> } }
      translate<0.5, 1.5, 0>
    }
    intersection{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5 inverse}
      box{<-1.5,-1.5,-0.1>,<0,0,1.1>}
      bounded_by{ box { <-1.5,-1.5,0>, <0, 0, 1> } }
      translate <-0.5,1.5,0>
    }
    box{ <-0.501,4,0>,<0.501,5,1> }
    box{ <-0.5,2,0>,<0.501,3,1> }
    box{ <-0.501,0,0>,<0.501,1,1> }
  }

#declare char_4 =
  union {
    box {<0,0,0>,<1,5,1>}
    box {<-2,1,0>,<2,2,1>}
    box {<0,-1,0>,<3.6,0,1> rotate z*56.31 translate <-2,2,0>}
  }

#declare char_5 =
  union {
    difference{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5}
      plane{x,0}
      bounded_by{ box { <0,-1.5,0>, <1.5, 1.5, 1> } }
      translate<0.5, 1.5, 0>
    }
    intersection{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5 inverse}
      box{<-1.5,-1.5,-0.1>,<0,0,1.1>}
      bounded_by{ box { <-1.5,-1.5,0>, <0, 0, 1> } }
      translate <-0.5,1.5,0>
    }
    box{ <-1.001,4,0>,<2,5,1> }
    box{ <-2,2,0>,<-1,5,1> }
    box{ <-1.001,2,0>,<0.501,3,1> }
    box{ <-0.501,0,0>,<0.501,1,1> }
  }

#declare char_6 =
  union {
    intersection{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5 inverse}
      box{<0,0,-0.1>,<1.5,1.5,1.1>}
      bounded_by{ box { <0,0,0>, <1.5, 1.5, 1> } }
      translate <0.5,3.5,0>
    }
    intersection{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5 inverse}
      box{<-1.5,0,-0.1>,<0,1.5,1.1>}
      bounded_by{ box { <-1.5,0,0>, <0,1.5,1> } }
      translate<-0.5, 3.5, 0>
    }
    difference{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5}
      plane{x,0}
      bounded_by{ box { <0,-1.5,0>, <1.5, 1.5, 1> } }
      translate<0.5, 1.5, 0>
    }
    difference{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5}
      plane{-x,0}
      bounded_by{ box { <-1.5,-1.5,0>, <0, 1.5, 1> } }
      translate <-0.5,1.5,0>
    }
    box{ <-0.501,4,0>,<0.501,5,1> }
    box{ <-2,1.5,0>,<-1,3.501,1> }
    box{ <-0.501,2,0>,<0.501,3,1> }
    box{ <-0.501,0,0>,<0.501,1,1> }
  }

#declare char_7 =
  union{
    box{ <-2,  4,0>,<  2,5,1> }
    intersection {
      box{ <-1,-1,0>,<0,4.272,1> rotate -z*20.556 translate x/2}
      box{<-0.5,0,-0.1>,<2,4.5,1.1>}
      bounded_by{box{<-0.5,0,-0>,<2,4.5,1>}}
    }
  }

#declare char_8 =
  union {
    difference{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5}
      plane{-x,0}
      bounded_by{ box { <-1.5,-1.5,0>, <0, 1.5, 1> } }
      translate<-0.5, 3.5, 0>
    }
    difference{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5}
      plane{x,0}
      bounded_by{ box { <0,-1.5,0>, <1.5, 1.5, 1> } }
      translate<0.5, 3.5, 0>
    }
    difference{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5}
      plane{x,0}
      bounded_by{ box { <0,-1.5,0>, <1.5, 1.5, 1> } }
      translate<0.5, 1.5, 0>
    }
    difference{
      cylinder{0*z,z,1.5}
      cylinder{-z,2*z,0.5}
      plane{-x,0}
      bounded_by{ box { <-1.5,-1.5,0>, <0, 1.5, 1> } }
      translate <-0.5,1.5,0>
    }
    box{ <-0.501,4,0>,<0.501,5,1> }
    box{ <-0.501,2,0>,<0.501,3,1> }
    box{ <-0.501,0,0>,<0.501,1,1> }
  }

#declare char_9 =
  object{char_6 translate -2.5*y rotate z*180 translate 2.5*y}

#declare char_ExclPt=
  union {
    cylinder {<0,4.5,0>,<0,4.5,1>,0.5}
    cylinder {<0,0.5,0>,<0,0.5,1>,0.5}
    intersection {
      box{<-0.5,-3,0>,<0.5,0,1> rotate	z*9.5}
      box{<-0.5,-3,-0.1>,<0.5,0,1.1> rotate -z*9.5 }
      bounded_by{box{<-0.5,-3,0>,<0.5,0,1> }}
      translate y*4.5
    }
  }

#declare char_AtSign =
  union {
    difference{
      cylinder{0*z,z,2}
      cylinder{-z,2*z,1.5}
      box { <0,-1.25,-0.1>, <2.5,0,1.1> }
      bounded_by{ box { <-2,-2,0>, <2,2,1> } }
      translate 2.5*y
    }
    difference{
      cylinder{0*z,z,0.75}
      cylinder{-z,2*z,0.25}
      plane{-y,0}
      bounded_by{ box { <-2,-2,0>, <2,0,1> } }
      translate <1.25,2.5,0>
    }
    difference{
      cylinder{0*z,z,1}
      cylinder{-z,2*z,0.5}
      bounded_by{ box { <-1,-1,0>, <1,1,1> } }
      translate 2.5*y
    }
  }

#declare char_Num =
  union {
    box{ <-0.5,-2,0>,<0.5,2,1> rotate -10*z translate <-1,2.5,0>}
    box{ <-0.5,-2,0>,<0.5,2,1> rotate -10*z translate < 1,2.5,0>}
    box{ <-1.5,3,0>,< 2,4,1> }
    box{ <-2,1,0>,< 1.5,2,1> }
  }

#declare char_Dol =
  union {
    difference{
      cylinder{0*z,z,1.25}
      cylinder{-z,2*z,0.25}
      plane{x,0}
      bounded_by{ box { <0,-1.25,0>, <1.25, 1.25, 1> } }
      translate<0.75, 1.75, 0>
    }
    difference{
      cylinder{0*z,z,1.25}
      cylinder{-z,2*z,0.25}
      plane{-x,0}
      bounded_by{ box { <-1.25,-1.25,0>, <0, 1.25, 1> } }
      translate<-0.75, 3.25, 0>
    }
    box{ <-0.751,3.5,0>,<2,4.5,1> }
    box{ <-0.751,2,0>,<0.751,3,1> }
    box{ <-2,0.5,0>,<0.751,1.5,1> }
    box{ <-0.5,0,0>,<0.5,5,1> }
  }

#declare char_Perc =
  union {
    difference{
      cylinder{0*z,z,1}
      cylinder{-z,2*z,0.25}
      bounded_by{ box { <-1,-1,0>, <1, 1, 1> } }
      translate<1, 1, 0>
    }
    difference{
      cylinder{0*z,z,1}
      cylinder{-z,2*z,0.25}
      bounded_by{ box { <-1,-1,0>, <1, 1, 1> } }
      translate<-1, 4, 0>
    }
    box{ <-0.25,-2.8,0>,<0.25,2.8,1> rotate -33*z translate 2.5*y}
  }

#declare char_Hat =
  intersection {
    union {
      box{ <0,0,0>,<1,3,1>  rotate -33*z translate <-2,1.5,0>}
      box{ <-1,0,0>,<0,3,1> rotate  33*z translate < 2,1.5,0>}
    }
    box {<-2.1,1.5,-0.1>,<2.1,3.75,1.1>}
    bounded_by{box {<-2.1,1.5,0>,<2.1,3.75,1>}}
  }

#declare char_Amps =
  union {
    difference{
      cylinder{0*z,z,1.25}
      cylinder{-z,2*z,0.5}
      bounded_by{ box { <-1.25,-1.25,0>, <1.25, 1.25, 1> } }
      translate <-0.25,3.75,0>
    }
    difference{
      cylinder{0*z,z,1.75}
      cylinder{-z,2*z,0.75}
      bounded_by{ box { <-1.75,-1.75,0>, <1.75, 1.75, 1> } }
      translate <-0.25,1.75,0>
    }
    difference{
      cylinder{0*z,z,1.25}
      cylinder{-z,2*z,0.5}
      plane{-x,0}
      bounded_by{ box { <-1.25,-1.25,0>, <0, 1.25, 1> } }
      translate <2,1.75,0>
    }
  }

#declare char_Astr =
  union {
    box{ <-0.5,-2,0>,<0.5,2,1> }
    box{ <-0.5,-2,0>,<0.5,2,1> rotate 60*z}
    box{ <-0.5,-2,0>,<0.5,2,1> rotate -60*z}
    translate 2.5*y
  }

#declare char_LPar =
  intersection{
    cylinder{<7,2.5,0>,<7,2.5,1>, 7.5}
    cylinder{<7,2.5,-0.1>,<7,2.5,1.1>, 6.5 inverse}
    box{<-2,0,-0.1>,<2,5,1.1>}
    bounded_by{box{<-1,0,0>,<1,5,1>}}
  }

#declare char_RPar =
  intersection{
    cylinder{<-7,2.5,0>,<-7,2.5,1>, 7.5}
    cylinder{<-7,2.5,-0.1>,<-7,2.5,1.1>, 6.5 inverse}
    box{<-2,0,-0.1>,<2,5,1.1>}
    bounded_by{box{<-1,0,0>,<1,5,1>}}
  }

#declare char_LSqu =
  union {
    box{<-1,0,0>,<0,5,1>}
    box{<-0.001,0,0>,<1,1,1>}
    box{<-0.001,4,0>,<1,5,1>}
  }

#declare char_RSqu =
  union {
    box{<0,0,0>,<1,5,1>}
    box{<-1,0,0>,<0.001,1,1>}
    box{<-1,4,0>,<0.001,5,1>}
  }


// End of CHARS.INC
#version Chars_Inc_Temp;
#end
`,
    'colors.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.7 Include File
//    File: colors.inc
//    Last updated: 2014-08-05
//    Description: This file contains pre-defined colors and color-manipulation macros.

#ifndef(Colors_Inc_Temp)

#declare Colors_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
    #debug "including colors.inc\\n"
#end

/*
              Persistence of Vision Raytracer Version 3.5
            Many pre-defined colors for use in scene files.
*/
// COLORS:
#declare Red     = rgb <1, 0, 0>;
#declare Green   = rgb <0, 1, 0>;
#declare Blue    = rgb <0, 0, 1>;
#declare Yellow  = rgb <1,1,0>;
#declare Cyan    = rgb <0, 1, 1>;
#declare Magenta = rgb <1, 0, 1>;
#declare Clear   = rgbf 1;
#declare White   = rgb 1;
#declare Black   = rgb 0;

// These grays are useful for fine-tuning lighting color values
// and for other areas where subtle variations of grays are needed.
// PERCENTAGE GRAYS:
#declare Gray05 = White*0.05;
#declare Gray10 = White*0.10;
#declare Gray15 = White*0.15;
#declare Gray20 = White*0.20;
#declare Gray25 = White*0.25;
#declare Gray30 = White*0.30;
#declare Gray35 = White*0.35;
#declare Gray40 = White*0.40;
#declare Gray45 = White*0.45;
#declare Gray50 = White*0.50;
#declare Gray55 = White*0.55;
#declare Gray60 = White*0.60;
#declare Gray65 = White*0.65;
#declare Gray70 = White*0.70;
#declare Gray75 = White*0.75;
#declare Gray80 = White*0.80;
#declare Gray85 = White*0.85;
#declare Gray90 = White*0.90;
#declare Gray95 = White*0.95;

// OTHER GRAYS
#declare DimGray = color red 0.329412 green 0.329412 blue 0.329412;
#declare DimGrey = color red 0.329412 green 0.329412 blue 0.329412;
#declare Gray = color red 0.752941 green 0.752941 blue 0.752941;
#declare Grey = color red 0.752941 green 0.752941 blue 0.752941;
#declare LightGray = color red 0.658824 green 0.658824 blue 0.658824;
#declare LightGrey = color red 0.658824 green 0.658824 blue 0.658824;
#declare VLightGray = color red 0.80 green 0.80 blue 0.80;
#declare VLightGrey = color red 0.80 green 0.80 blue 0.80;

#declare Aquamarine = color red 0.439216 green 0.858824 blue 0.576471;
#declare BlueViolet = color red 0.62352 green 0.372549 blue 0.623529;
#declare Brown = color red 0.647059 green 0.164706 blue 0.164706;
#declare CadetBlue = color red 0.372549 green 0.623529 blue 0.623529;
#declare Coral = color red 1.0 green 0.498039 blue 0.0;
#declare CornflowerBlue = color red 0.258824 green 0.258824 blue 0.435294;
#declare DarkGreen = color red 0.184314 green 0.309804 blue 0.184314;
#declare DarkOliveGreen = color red 0.309804 green 0.309804 blue 0.184314;
#declare DarkOrchid = color red 0.6 green 0.196078 blue 0.8;
#declare DarkSlateBlue = color red 0.119608 green 0.137255 blue 0.556863;
#declare DarkSlateGray = color red 0.184314 green 0.309804 blue 0.309804;
#declare DarkSlateGrey = color red 0.184314 green 0.309804 blue 0.309804;
#declare DarkTurquoise = color red 0.439216 green 0.576471 blue 0.858824;
#declare Firebrick = color red 0.556863 green 0.137255 blue 0.137255;
#declare ForestGreen = color red 0.137255 green 0.556863 blue 0.137255;
#declare Gold = color red 0.8 green 0.498039 blue 0.196078;
#declare Goldenrod = color red 0.858824 green 0.858824 blue 0.439216;
#declare GreenYellow = color red 0.576471 green 0.858824 blue 0.439216;
#declare IndianRed = color red 0.309804 green 0.184314 blue 0.184314;
#declare Khaki = color red 0.623529 green 0.623529 blue 0.372549;
#declare LightBlue = color red 0.74902 green 0.847059 blue 0.847059;
#declare LightSteelBlue = color red 0.560784 green 0.560784 blue 0.737255;
#declare LimeGreen = color red 0.196078 green 0.8 blue 0.196078;
#declare Maroon = color red 0.556863 green 0.137255 blue 0.419608;
#declare MediumAquamarine = color red 0.196078 green 0.8 blue 0.6;
#declare MediumBlue = color red 0.196078 green 0.196078 blue 0.8;
#declare MediumForestGreen = color red 0.419608 green 0.556863 blue 0.137255;
#declare MediumGoldenrod = color red 0.917647 green 0.917647 blue 0.678431;
#declare MediumOrchid = color red 0.576471 green 0.439216 blue 0.858824;
#declare MediumSeaGreen = color red 0.258824 green 0.435294 blue 0.258824;
#declare MediumSlateBlue = color red 0.498039 blue 1.0;
#declare MediumSpringGreen = color red 0.498039 green 1.0;
#declare MediumTurquoise = color red 0.439216 green 0.858824 blue 0.858824;
#declare MediumVioletRed = color red 0.858824 green 0.439216 blue 0.576471;
#declare MidnightBlue = color red 0.184314 green 0.184314 blue 0.309804;
#declare Navy = color red 0.137255 green 0.137255 blue 0.556863;
#declare NavyBlue = color red 0.137255 green 0.137255 blue 0.556863;
#declare Orange = color red 1 green 0.5 blue 0.0;
#declare OrangeRed = color red 1.0 green 0.25;
#declare Orchid = color red 0.858824 green 0.439216 blue 0.858824;
#declare PaleGreen = color red 0.560784 green 0.737255 blue 0.560784;
#declare Pink = color red 0.737255 green 0.560784 blue 0.560784;
#declare Plum = color red 0.917647 green 0.678431 blue 0.917647;
#declare Salmon = color red 0.435294 green 0.258824 blue 0.258824;
#declare SeaGreen = color red 0.137255 green 0.556863 blue 0.419608;
#declare Sienna = color red 0.556863 green 0.419608 blue 0.137255;
#declare SkyBlue = color red 0.196078 green 0.6 blue 0.8;
#declare SlateBlue = color green 0.498039 blue 1.0;
#declare SpringGreen = color green 1.0 blue 0.498039;
#declare SteelBlue = color red 0.137255 green 0.419608 blue 0.556863;
#declare Tan = color red 0.858824 green 0.576471 blue 0.439216;
#declare Thistle = color red 0.847059 green 0.74902 blue 0.847059;
#declare Turquoise = color red 0.678431 green 0.917647 blue 0.917647;
#declare Violet = color red 0.309804 green 0.184314 blue 0.309804;
#declare VioletRed = color red 0.8 green 0.196078 blue 0.6;
#declare Wheat = color red 0.847059 green 0.847059 blue 0.74902;
#declare YellowGreen = color red 0.6 green 0.8 blue 0.196078;
#declare SummerSky = color red 0.22 green 0.69 blue 0.87;
#declare RichBlue = color red 0.35 green 0.35 blue 0.67;
#declare Brass =  color red 0.71 green 0.65 blue 0.26;
#declare Copper = color red 0.72 green 0.45 blue 0.20;
#declare Bronze = color red 0.55 green 0.47 blue 0.14;
#declare Bronze2 = color red 0.65 green 0.49 blue 0.24;
#declare Silver = color red 0.90 green 0.91 blue 0.98;
#declare BrightGold = color red 0.85 green 0.85 blue 0.10;
#declare OldGold =  color red 0.81 green 0.71 blue 0.23;
#declare Feldspar = color red 0.82 green 0.57 blue 0.46;
#declare Quartz = color red 0.85 green 0.85 blue 0.95;
#declare Mica = color Black;  // needed in textures.inc
#declare NeonPink = color red 1.00 green 0.43 blue 0.78;
#declare DarkPurple = color red 0.53 green 0.12 blue 0.47;
#declare NeonBlue = color red 0.30 green 0.30 blue 1.00;
#declare CoolCopper = color red 0.85 green 0.53 blue 0.10;
#declare MandarinOrange = color red 0.89 green 0.47 blue 0.20;
#declare LightWood = color red 0.91 green 0.76 blue 0.65;
#declare MediumWood = color red 0.65 green 0.50 blue 0.39;
#declare DarkWood = color red 0.52 green 0.37 blue 0.26;
#declare SpicyPink = color red 1.00 green 0.11 blue 0.68;
#declare SemiSweetChoc = color red 0.42 green 0.26 blue 0.15;
#declare BakersChoc = color red 0.36 green 0.20 blue 0.09;
#declare Flesh = color red 0.96 green 0.80 blue 0.69;
#declare NewTan = color red 0.92 green 0.78 blue 0.62;
#declare NewMidnightBlue = color red 0.00 green 0.00 blue 0.61;
#declare VeryDarkBrown = color red 0.35 green 0.16 blue 0.14;
#declare DarkBrown = color red 0.36 green 0.25 blue 0.20;
#declare DarkTan = color red 0.59 green 0.41 blue 0.31;
#declare GreenCopper = color red 0.32 green 0.49 blue 0.46;
#declare DkGreenCopper = color red 0.29 green 0.46 blue 0.43;
#declare DustyRose = color red 0.52 green 0.39 blue 0.39;
#declare HuntersGreen = color red 0.13 green 0.37 blue 0.31;
#declare Scarlet = color red 0.55 green 0.09 blue 0.09;

#declare Med_Purple =  color red 0.73 green 0.16 blue 0.96;
#declare Light_Purple = color red 0.87 green 0.58 blue 0.98;
#declare Very_Light_Purple = color red 0.94 green 0.81 blue 0.99;


// Color manipulation macros

// Takes Hue value as input, returns RGB vector.
#macro CH2RGB (HH)
   #local H = mod(HH, 360);
   #local H = (H < 0 ? H+360 : H);
   #switch (H)
      #range (0, 120)
         #local R = (120-  H) / 60;
         #local G = (  H-  0) / 60;
         #local B = 0;
      #break
      #range (120, 240)
         #local R = 0;
         #local G = (240-  H) / 60;
         #local B = (  H-120) / 60;
      #break
      #range (240, 360)
         #local R = (  H-240) / 60;
         #local G = 0;
         #local B = (360-  H) / 60;
      #break
   #end
   <min(R,1), min(G,1), min(B,1)>
#end

// Takes RGB vector, Max component, and Span as input,
// returns Hue value.
#macro CRGB2H (RGB, Max, Span)
   #local H = 0;
   #local R = RGB.red;
   #local G = RGB.green;
   #local B = RGB.blue;
   #if (Span>0)
      #local H = (
         + (R = Max & G != Max ? 0 + (G - B)/Span : 0)
         + (G = Max & B != Max ? 2 + (B - R)/Span : 0)
         + (B = Max & R != Max ? 4 + (R - G)/Span : 0)
      )*60;
   #end
   H
#end

// Converts a color in HSL color space to a color in RGB color space.
// Input:  < Hue, Saturation, Lightness, Filter, Transmit >
// Output: < Red, Green, Blue, Filter, Transmit >
#macro CHSL2RGB(Color)
   #local HSLFT = color Color;
   #local H = (HSLFT.red);
   #local S = (HSLFT.green);
   #local L = (HSLFT.blue);
   #local SatRGB = CH2RGB(H);
   #local Col = 2*S*SatRGB + (1-S)*<1,1,1>;
   #if (L<0.5)
      #local RGB = L*Col;
   #else
      #local RGB = (1-L)*Col + (2*L-1)*<1,1,1>;
   #end
   <RGB.red,RGB.green,RGB.blue,(HSLFT.filter),(HSLFT.transmit)>
#end

// Converts a color in RGB color space to a color in HSL color space.
// Input:  < Red, Green, Blue, Filter, Transmit >
// Output: < Hue, Saturation, Lightness, Filter, Transmit >
#macro CRGB2HSL(Color)
   #local RGBFT = color Color;
   #local R = (RGBFT.red);
   #local G = (RGBFT.green);
   #local B = (RGBFT.blue);
   #local Min = min(R,min(G,B));
   #local Max = max(R,max(G,B));
   #local Span = Max-Min;
   #local L = (Min+Max)/2;
   #local S = 0;
   #if( L!=0 & L!=1 )
      #local S = Span / ( L<0.5 ? (L*2) : (2-L*2) );
   #end
   #local H = CRGB2H (<R,G,B>, Max, Span);
   <H,S,L,(RGBFT.filter),(RGBFT.transmit)>
#end

// Converts a color in HSV color space to a color in RGB color space.
// Input:  < Hue, Saturation, Value, Filter, Transmit >
// Output: < Red, Green, Blue, Filter, Transmit >
#macro CHSV2RGB(Color)
   #local HSVFT = color Color;
   #local H = (HSVFT.red);
   #local S = (HSVFT.green);
   #local V = (HSVFT.blue);
   #local SatRGB = CH2RGB(H);
   #local RGB = ( ((1-S)*<1,1,1> + S*SatRGB) * V );
   <RGB.red,RGB.green,RGB.blue,(HSVFT.filter),(HSVFT.transmit)>
#end

// Converts a color in RGB color space to a color in HSV color space.
// Input:  < Red, Green, Blue, Filter, Transmit >
// Output: < Hue, Saturation, Value, Filter, Transmit >
#macro CRGB2HSV(Color)
   #local RGBFT = color Color;
   #local R = (RGBFT.red);
   #local G = (RGBFT.green);
   #local B = (RGBFT.blue);
   #local Min = min(R,min(G,B));
   #local Max = max(R,max(G,B));
   #local Span = Max-Min;
   #local H = CRGB2H (<R,G,B>, Max, Span);
   #local S = 0; #if (Max!=0) #local S = Span/Max; #end
   <H,S,Max,(RGBFT.filter),(RGBFT.transmit)>
#end

// Converts a color in CIE XYZ color space to a color in RGB color space (using sRGB primaries and whitepoint).
// Input:  < X, Y, Z, Filter, Transmit >
// Output: < R, G, B, Filter, Transmit >
#macro CXYZ2RGB(Color)
   #local XYZFT = color Color;
   #local XYZ = <(XYZFT.red),(XYZFT.green),(XYZFT.blue)>;
   #local R = vdot(XYZ, <3.24096994190452,   -1.53738317757009, -0.498610760293003>);
   #local G = vdot(XYZ, <-0.969243636280880,  1.87596750150772,  0.0415550574071757>);
   #local B = vdot(XYZ, <0.0556300796969937, -0.203976958888977, 1.05697151424288>);
   <R,G,B,(XYZFT.filter),(XYZFT.transmit)>
#end

// Converts a color in RGB color space (using sRGB primaries and whitepoint) to a color in CIE XYZ color space.
// Input:  < R, G, B, Filter, Transmit >
// Output: < X, Y, Z, Filter, Transmit >
#macro CRGB2XYZ(Color)
   #local RGBFT = color Color;
   #local RGB = <(RGBFT.red),(RGBFT.green),(RGBFT.blue)>;
   #local X = vdot(RGB, <0.412390799265959,  0.357584339383878, 0.180480788401834>);
   #local Y = vdot(RGB, <0.212639005871510,  0.715168678767756, 0.0721923153607337>);
   #local Z = vdot(RGB, <0.0193308187155918, 0.119194779794626, 0.950532152249661>);
   <X,Y,Z,(RGBFT.filter),(RGBFT.transmit)>
#end

// helper function for the CLab2RGB macro
#declare CLab2RGB_f = function(x) { select(x-6/29, (108/841)*(x-4/29), pow(x,3)) }

// Converts a color in CIE L*a*b* color space to a color in RGB color space (using sRGB primaries and whitepoint).
// Input:  < L*, a*, b*, Filter, Transmit >, <L*a*b* Reference White XYZ>
// Output: < R, G, B, Filter, Transmit >
#macro CLab2RGB(Color,WhiteXYZ)
   #local D65 = <0.95043, 1.00000, 1.08890>;
   #local LabFT = color Color;
   #local L = (LabFT.red);
   #local a = (LabFT.green);
   #local b = (LabFT.blue);
   #local Lterm = (L+16)/116;
   #local X = (WhiteXYZ.x) * CLab2RGB_f(Lterm + a/500);
   #local Y = (WhiteXYZ.y) * CLab2RGB_f(Lterm);
   #local Z = (WhiteXYZ.z) * CLab2RGB_f(Lterm - b/200);
   CXYZ2RGB(<X,Y,Z,(LabFT.filter),(LabFT.transmit)>)
#end

// Converts a color in CIE L*a*b* color space (with D65 reference white) to a color in RGB color space (using sRGB primaries).
// Input:  < L*, a*, b*, Filter, Transmit >
// Output: < R, G, B, Filter, Transmit >
#macro CLab2RGB_D65(Color)
   CLab2RGB(Color,<0.95043, 1.00000, 1.08890>)
#end

// helper function for the CRGB2Lab macro
#declare CRGB2Lab_f = function(x) { select(x-216/24389, (841/108)*x+4/29, pow(x,1/3)) }

// Converts a color in RGB color space (using sRGB primaries) to a color in CIE L*a*b* color space (with D65 reference white) .
// Input:  < R, G, B, Filter, Transmit >, <L*a*b* Reference White XYZ>
// Output: < L*, a*, b*, Filter, Transmit >
#macro CRGB2Lab(Color,WhiteXYZ)
   #local XYZFT = CRGB2XYZ(Color);
   #local fX = CRGB2Lab_f( (XYZFT.red)   / (WhiteXYZ.x) );
   #local fY = CRGB2Lab_f( (XYZFT.green) / (WhiteXYZ.y) );
   #local fZ = CRGB2Lab_f( (XYZFT.blue)  / (WhiteXYZ.z) );
   #local L = 116 * fY - 16;
   #local a = 500 * (fX-fY);
   #local b = 200 * (fY-fZ);
   <L,a,b,(XYZFT.filter),(XYZFT.transmit)>
#end

// Converts a color in RGB color space (using sRGB primaries) to a color in CIE L*a*b* color space (with D65 reference white) .
// Input:  < R, G, B, Filter, Transmit >, <L*a*b* Reference White XYZ>
// Output: < L*, a*, b*, Filter, Transmit >
#macro CRGB2Lab_D65(Color)
   CRGB2Lab(Color,<0.95043, 1.00000, 1.08890>)
#end

#version Colors_Inc_Temp;
#end
`,
    'colors_ral.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.7 Include File
//    File: colors_ral.inc
//    Last updated: 2016-12-24
//    Description: This file contains pre-defined colors from the German RAL Classic collection.

#ifndef(Colors_Ral_Inc_Temp)

#declare Colors_Ral_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
    #debug "including colors_ral.inc\\n"
#end

#include "colors.inc"


// Source: Wikipedia, https://de.wikipedia.org/wiki/RAL-Farbe#Farbtabelle, 2016-12-22
// NOTE: Colours should be expected to differ slightly from official RAL publications, except for
// those marked with an asterisk.
// NOTE: These colour definitions require the use of "assumed_gamma 1.0".

// RAL 1xxx - YELLOW TONES

#declare RAL_1000 = rgb CLab2RGB_D65(<76.02, -0.37, 27.64>); //*Gr�nbeige         // Green beige
#declare RAL_1001 = rgb CLab2RGB_D65(<74.99,  5.10, 24.64>); // Beige             // Beige
#declare RAL_1002 = rgb CLab2RGB_D65(<73.45,  6.83, 33.80>); // Sandgelb          // Sand yellow
#declare RAL_1003 = rgb CLab2RGB_D65(<75.99, 18.80, 72.93>); // Signalgelb        // Signal yellow
#declare RAL_1004 = rgb CLab2RGB_D65(<71.42, 15.28, 69.28>); // Goldgelb          // Golden yellow
#declare RAL_1005 = rgb CLab2RGB_D65(<63.45, 13.38, 74.69>); //*Honiggelb         // Honey yellow
#declare RAL_1006 = rgb CLab2RGB_D65(<68.20, 21.13, 65.98>); // Maisgelb          // Maize yellow
#declare RAL_1007 = rgb CLab2RGB_D65(<68.38, 25.44, 67.13>); // Narzissengelb     // Daffodil yellow

#declare RAL_1011 = rgb CLab2RGB_D65(<59.92, 11.35, 29.17>); // Braunbeige        // Brown beige
#declare RAL_1012 = rgb CLab2RGB_D65(<75.04,  4.64, 61.31>); // Zitronengelb      // Lemon yellow
#declare RAL_1013 = rgb CLab2RGB_D65(<87.15,  0.27, 10.43>); //*Perlwei�          // Oyster white
#declare RAL_1014 = rgb CLab2RGB_D65(<81.22,  2.47, 22.88>); // Elfenbein         // Ivory
#declare RAL_1015 = rgb CLab2RGB_D65(<86.40,  2.06, 15.48>); // Hellelfenbein     // Light ivory
#declare RAL_1016 = rgb CLab2RGB_D65(<88.37, -9.78, 71.30>); // Schwefelgelb      // Sulfur yellow
#declare RAL_1017 = rgb CLab2RGB_D65(<76.32, 19.37, 51.02>); // Safrangelb        // Saffron yellow
#declare RAL_1018 = rgb CLab2RGB_D65(<83.35,  3.46, 75.83>); //*Zinkgelb          // Zinc yellow
#declare RAL_1019 = rgb CLab2RGB_D65(<62.62,  4.31, 12.94>); // Graubeige         // Grey beige
#declare RAL_1020 = rgb CLab2RGB_D65(<61.98,  0.39, 23.18>); // Olivgelb          // Olive yellow
#declare RAL_1021 = rgb CLab2RGB_D65(<78.88, 10.03, 82.04>); // Rapsgelb          // Colza yellow

#declare RAL_1023 = rgb CLab2RGB_D65(<79.07, 10.46, 80.50>); // Verkehrsgelb      // Traffic yellow
#declare RAL_1024 = rgb CLab2RGB_D65(<64.26,  8.49, 41.49>); //*Ockergelb         // Ochre yellow

#declare RAL_1026 = rgb CLab2RGB_D65(<95.36,-21.56,120.18>); // Leuchtgelb        // Luminous yellow
#declare RAL_1027 = rgb CLab2RGB_D65(<58.15,  5.83, 47.68>); // Currygelb         // Curry
#declare RAL_1028 = rgb CLab2RGB_D65(<74.97, 29.64, 79.69>); // Melonengelb       // Melon yellow

#declare RAL_1032 = rgb CLab2RGB_D65(<72.32, 12.16, 66.97>); // Ginstergelb       // Broom yellow
#declare RAL_1033 = rgb CLab2RGB_D65(<71.74, 27.78, 71.68>); //*Dahliengelb       // Dahlia yellow
#declare RAL_1034 = rgb CLab2RGB_D65(<72.73, 21.40, 45.09>); // Pastellgelb       // Pastel yellow
#declare RAL_1035 = rgb CLab2RGB_D65(<54.79,  0.35, 11.86>); // Perlbeige         // Pearl beige
#declare RAL_1036 = rgb CLab2RGB_D65(<48.95,  4.77, 26.69>); // Perlgold          // Pearl gold
#declare RAL_1037 = rgb CLab2RGB_D65(<70.28, 26.19, 64.79>); // Sonnengelb        // Sun yellow

// RAL 2xxx - ORANGE TONES

#declare RAL_2000 = rgb CLab2RGB_D65(<58.20, 37.30, 68.68>); //*Gelborange        // Yellow orange
#declare RAL_2001 = rgb CLab2RGB_D65(<49.41, 39.79, 35.29>); // Rotorange         // Red orange
#declare RAL_2002 = rgb CLab2RGB_D65(<47.74, 47.87, 33.73>); // Blutorange        // Vermilion
#declare RAL_2003 = rgb CLab2RGB_D65(<66.02, 41.22, 52.36>); // Pastellorange     // Pastel orange
#declare RAL_2004 = rgb CLab2RGB_D65(<56.89, 50.34, 49.81>); // Reinorange        // Pure orange
#declare RAL_2005 = rgb CLab2RGB_D65(<72.27, 87.78, 82.31>); //*Leuchtorange      // Luminous orange

#declare RAL_2007 = rgb CLab2RGB_D65(<76.86, 47.87, 97.63>); // Leuchthellorange  // Luminous bright orange
#declare RAL_2008 = rgb CLab2RGB_D65(<61.99, 44.64, 51.72>); // Hellrotorange     // Bright red orange
#declare RAL_2009 = rgb CLab2RGB_D65(<55.83, 47.79, 48.83>); // Verkehrsorange    // Traffic orange
#declare RAL_2010 = rgb CLab2RGB_D65(<55.39, 40.10, 42.42>); // Signalorange      // Signal orange
#declare RAL_2011 = rgb CLab2RGB_D65(<59.24, 40.86, 64.50>); //*Tieforange        // Deep orange
#declare RAL_2012 = rgb CLab2RGB_D65(<57.75, 40.28, 30.66>); // Lachsorange       // Salmon orange
#declare RAL_2013 = rgb CLab2RGB_D65(<40.73, 32.14, 34.92>); // Perlorange        // Pearl orange

// RAL 3xxx - RED TONES

#declare RAL_3000 = rgb CLab2RGB_D65(<42.40, 43.24, 25.00>); // Feuerrot          // Flame red
#declare RAL_3001 = rgb CLab2RGB_D65(<40.19, 41.21, 21.60>); // Signalrot         // Signal red
#declare RAL_3002 = rgb CLab2RGB_D65(<34.46, 48.83, 31.87>); //*Karminrot         // Carmine red
#declare RAL_3003 = rgb CLab2RGB_D65(<35.59, 35.87, 15.75>); // Rubinrot          // Ruby red
#declare RAL_3004 = rgb CLab2RGB_D65(<33.05, 25.61,  9.02>); // Purpurrot         // Purple red
#declare RAL_3005 = rgb CLab2RGB_D65(<30.96, 18.46,  5.76>); // Weinrot           // Wine red

#declare RAL_3007 = rgb CLab2RGB_D65(<28.34,  8.14,  2.22>); // Schwarzrot        // Black red

#declare RAL_3009 = rgb CLab2RGB_D65(<29.27, 24.59, 16.51>); //*Oxidrot           // Oxide red

#declare RAL_3011 = rgb CLab2RGB_D65(<34.52, 28.66, 13.44>); // Braunrot          // Brown red
#declare RAL_3012 = rgb CLab2RGB_D65(<63.81, 20.79, 20.45>); // Beigerot          // Beige red
#declare RAL_3013 = rgb CLab2RGB_D65(<40.70, 36.67, 21.37>); // Tomatenrot        // Tomato red
#declare RAL_3014 = rgb CLab2RGB_D65(<60.17, 32.49, 12.58>); // Altrosa           // Antique pink
#declare RAL_3015 = rgb CLab2RGB_D65(<71.23, 21.59,  4.98>); //*Hellrosa          // Light pink
#declare RAL_3016 = rgb CLab2RGB_D65(<44.70, 37.92, 23.96>); // Korallenrot       // Coral red
#declare RAL_3017 = rgb CLab2RGB_D65(<54.24, 44.26, 16.87>); // Ros�              // Rose
#declare RAL_3018 = rgb CLab2RGB_D65(<50.77, 49.15, 19.86>); // Erdbeerrot        // Strawberry red

#declare RAL_3020 = rgb CLab2RGB_D65(<44.66, 52.03, 32.26>); // Verkehrsrot       // Traffic red

#declare RAL_3022 = rgb CLab2RGB_D65(<56.06, 38.90, 29.70>); //*Lachsrot          // Salmon pink

#declare RAL_3024 = rgb CLab2RGB_D65(<51.32, 82.52, 71.62>); // Leuchtrot         // Luminous red

#declare RAL_3026 = rgb CLab2RGB_D65(<54.38, 86.26, 76.07>); // Leuchthellrot     // Luminous bright red
#declare RAL_3027 = rgb CLab2RGB_D65(<43.07, 46.96, 15.81>); // Himbeerrot        // Raspberry red
#declare RAL_3028 = rgb CLab2RGB_D65(<48.80, 54.42, 33.08>); // Reinrot           // Pure red

#declare RAL_3031 = rgb CLab2RGB_D65(<39.39, 47.09, 24.71>); //*Orientrot         // Orient red
#declare RAL_3032 = rgb CLab2RGB_D65(<26.88, 41.34, 19.40>); // Perlrubinrot      // Pearl ruby red
#declare RAL_3033 = rgb CLab2RGB_D65(<44.29, 45.11, 28.62>); // Perlrosa          // Pearl pink

// RAL 4xxx - PURPLE TONES

#declare RAL_4001 = rgb CLab2RGB_D65(<49.10, 17.35,-12.85>); // Rotlila           // Red lilac
#declare RAL_4002 = rgb CLab2RGB_D65(<41.91, 30.05,  5.67>); // Rotviolett        // Red violet
#declare RAL_4003 = rgb CLab2RGB_D65(<54.25, 44.66, -5.02>); //*Erikaviolett      // Heather violet
#declare RAL_4004 = rgb CLab2RGB_D65(<32.22, 24.83,  0.06>); // Bordeauxviolett   // Claret violet
#declare RAL_4005 = rgb CLab2RGB_D65(<50.92, 15.38,-23.06>); // Blaulila          // Blue lilac
#declare RAL_4006 = rgb CLab2RGB_D65(<42.38, 39.48,-14.94>); // Verkehrspurpur    // Traffic purple
#declare RAL_4007 = rgb CLab2RGB_D65(<30.05, 13.16, -5.10>); // Purpurviolett     // Purple violet
#declare RAL_4008 = rgb CLab2RGB_D65(<40.76, 32.53,-20.56>); //*Signalviolett     // Signal violet
#declare RAL_4009 = rgb CLab2RGB_D65(<60.59, 10.38, -2.88>); // Pastellviolett    // Pastel violet
#declare RAL_4010 = rgb CLab2RGB_D65(<50.39, 48.95, -4.24>); // Telemagenta       // Telemagenta
#declare RAL_4011 = rgb CLab2RGB_D65(<47.92, 18.89,-20.83>); // Perlviolett       // Pearl violet
#declare RAL_4012 = rgb CLab2RGB_D65(<46.33,  7.27,-11.94>); // Perlbrombeer      // Pearl blackberry

// RAL 5xxx - BLUE TONES

#declare RAL_5000 = rgb CLab2RGB_D65(<32.59, -1.28,-21.69>); //*Violettblau       // Violet blue
#declare RAL_5001 = rgb CLab2RGB_D65(<35.43, -7.52,-16.65>); // Gr�nblau          // Green blue
#declare RAL_5002 = rgb CLab2RGB_D65(<33.11,  8.43,-35.40>); // Ultramarinblau    // Ultramarine blue
#declare RAL_5003 = rgb CLab2RGB_D65(<30.53, -0.37,-16.68>); // Saphirblau        // Sapphire blue
#declare RAL_5004 = rgb CLab2RGB_D65(<26.56, -0.19, -4.07>); // Schwarzblau       // Black blue
#declare RAL_5005 = rgb CLab2RGB_D65(<32.45, -6.68,-37.20>); //*Signalblau        // Signal blue

#declare RAL_5007 = rgb CLab2RGB_D65(<46.37, -6.24,-21.71>); // Brillantblau      // Brilliant blue
#declare RAL_5008 = rgb CLab2RGB_D65(<32.00, -2.09, -6.07>); // Graublau          // Grey blue
#declare RAL_5009 = rgb CLab2RGB_D65(<41.22, -9.56,-18.34>); // Azurblau          // Azure blue
#declare RAL_5010 = rgb CLab2RGB_D65(<36.57, -5.81,-28.94>); // Enzianblau        // Gentian blue
#declare RAL_5011 = rgb CLab2RGB_D65(<16.97, -1.20,-13.15>); //*Stahlblau         // Steel blue
#declare RAL_5012 = rgb CLab2RGB_D65(<55.62,-13.84,-30.72>); // Lichtblau         // Light blue
#declare RAL_5013 = rgb CLab2RGB_D65(<29.81,  1.67,-17.20>); // Kobaltblau        // Cobalt blue
#declare RAL_5014 = rgb CLab2RGB_D65(<53.79, -2.64,-15.59>); // Taubenblau        // Pigeon blue
#declare RAL_5015 = rgb CLab2RGB_D65(<51.13,-12.69,-34.21>); // Himmelblau        // Sky blue

#declare RAL_5017 = rgb CLab2RGB_D65(<34.82,-13.49,-36.36>); //*Verkehrsblau      // Traffic blue
#declare RAL_5018 = rgb CLab2RGB_D65(<55.13,-27.27, -8.47>); // T�rkisblau        // Turquoise blue
#declare RAL_5019 = rgb CLab2RGB_D65(<41.18, -9.97,-25.87>); // Capriblau         // Capri blue
#declare RAL_5020 = rgb CLab2RGB_D65(<32.30,-13.01, -9.39>); // Ozeanblau         // Ocean blue
#declare RAL_5021 = rgb CLab2RGB_D65(<47.15,-29.26, -9.32>); // Wasserblau        // Water blue
#declare RAL_5022 = rgb CLab2RGB_D65(<19.87, 10.63,-28.48>); //*Nachtblau         // Night blue
#declare RAL_5023 = rgb CLab2RGB_D65(<47.64, -2.96,-21.18>); // Fernblau          // Distant blue
#declare RAL_5024 = rgb CLab2RGB_D65(<60.50, -9.53,-17.38>); // Pastellblau       // Pastel blue
#declare RAL_5025 = rgb CLab2RGB_D65(<35.93,-11.81,-16.28>); // Perlenzian        // Pearl gentian blue
#declare RAL_5026 = rgb CLab2RGB_D65(<16.00,  7.84,-29.10>); // Perlnachtblau     // Pearl night blue

// RAL 6xxx - GREEN TONES

#declare RAL_6000 = rgb CLab2RGB_D65(<44.53,-23.65,  5.32>); //*Patinagr�n        // Patina green
#declare RAL_6001 = rgb CLab2RGB_D65(<43.86,-23.57, 18.31>); // Smaragdgr�n       // Emerald green
#declare RAL_6002 = rgb CLab2RGB_D65(<39.87,-19.39, 16.95>); // Laubgr�n          // Leaf green
#declare RAL_6003 = rgb CLab2RGB_D65(<39.25, -4.36, 10.17>); // Olivgr�n          // Olive green
#declare RAL_6004 = rgb CLab2RGB_D65(<33.40,-13.17, -3.07>); // Blaugr�n          // Blue green
#declare RAL_6005 = rgb CLab2RGB_D65(<24.44,-20.57,  4.67>); //*Moosgr�n          // Moss green
#declare RAL_6006 = rgb CLab2RGB_D65(<33.04, -1.11,  4.17>); // Grauoliv          // Grey olive
#declare RAL_6007 = rgb CLab2RGB_D65(<30.42, -3.85,  4.77>); // Flaschengr�n      // Bottle green
#declare RAL_6008 = rgb CLab2RGB_D65(<29.82, -0.67,  4.34>); // Braungr�n         // Brown green
#declare RAL_6009 = rgb CLab2RGB_D65(<29.81, -5.74,  3.12>); // Tannengr�n        // Fir green
#declare RAL_6010 = rgb CLab2RGB_D65(<42.99,-22.87, 26.09>); //*Grasgr�n          // Grass green
#declare RAL_6011 = rgb CLab2RGB_D65(<53.24,-11.61, 14.48>); // Resedagr�n        // Reseda green
#declare RAL_6012 = rgb CLab2RGB_D65(<31.94, -4.36, -0.46>); // Schwarzgr�n       // Black green
#declare RAL_6013 = rgb CLab2RGB_D65(<52.30, -2.08, 14.26>); // Schilfgr�n        // Reed green
#declare RAL_6014 = rgb CLab2RGB_D65(<33.84,  0.46,  6.15>); // Gelboliv          // Yellow olive
#declare RAL_6015 = rgb CLab2RGB_D65(<25.48, -1.59,  4.15>); //*Schwarzoliv       // Black olive
#declare RAL_6016 = rgb CLab2RGB_D65(<42.92,-32.22,  6.72>); // T�rkisgr�n        // Turquoise green
#declare RAL_6017 = rgb CLab2RGB_D65(<52.33,-23.24, 26.15>); // Maigr�n           // May green
#declare RAL_6018 = rgb CLab2RGB_D65(<59.83,-32.96, 37.72>); // Gelbgr�n          // Yellow green
#declare RAL_6019 = rgb CLab2RGB_D65(<81.42,-12.57, 13.50>); // Wei�gr�n          // Pastel green
#declare RAL_6020 = rgb CLab2RGB_D65(<26.34, -8.37, 10   >); //*Chromoxidgr�n     // Chrome green
#declare RAL_6021 = rgb CLab2RGB_D65(<63.69,-11.28, 14.13>); // Blassgr�n         // Pale green
#declare RAL_6022 = rgb CLab2RGB_D65(<30.43,  0.54,  5.62>); // Braunoliv         // Olive drab

#declare RAL_6024 = rgb CLab2RGB_D65(<51.81,-38.02, 15.50>); // Verkehrsgr�n      // Traffic green
#declare RAL_6025 = rgb CLab2RGB_D65(<47.45,-13.45, 21.37>); // Farngr�n          // Fern green
#declare RAL_6026 = rgb CLab2RGB_D65(<34.35,-36.57,  0.83>); //*Opalgr�n          // Opal green
#declare RAL_6027 = rgb CLab2RGB_D65(<72.80,-19.82, -3.62>); // Lichtgr�n         // Light green
#declare RAL_6028 = rgb CLab2RGB_D65(<38.15,-12.86,  3.82>); // Kieferngr�n       // Pine green
#declare RAL_6029 = rgb CLab2RGB_D65(<44.18,-39.06, 15.73>); // Minzgr�n          // Mint green

#declare RAL_6032 = rgb CLab2RGB_D65(<50.67,-33.25, 14.76>); // Signalgr�n        // Signal green
#declare RAL_6033 = rgb CLab2RGB_D65(<51.93,-22.93, -2.33>); //*Mintt�rkis        // Mint turquoise
#declare RAL_6034 = rgb CLab2RGB_D65(<69.16,-15.95, -5.10>); // Pastellt�rkis     // Pastel turquoise
#declare RAL_6035 = rgb CLab2RGB_D65(<29.14,-29.19, 16.35>); // Perlgr�n          // Pearl green
#declare RAL_6036 = rgb CLab2RGB_D65(<33.97,-29.04,  0.68>); // Perlopalgr�n      // Pearl opal green
#declare RAL_6037 = rgb CLab2RGB_D65(<53.49,-46.77, 34.32>); // Reingr�n          // Pure green
#declare RAL_6038 = rgb CLab2RGB_D65(<62.31,-84.29, 57.55>); //*Leuchtgr�n        // Luminous green

// RAL 7xxx - GREY TONES

#declare RAL_7000 = rgb CLab2RGB_D65(<58.32, -3.14, -4.71>); // Fehgrau           // Squirrel grey
#declare RAL_7001 = rgb CLab2RGB_D65(<63.81, -2.22, -4.05>); // Silbergrau        // Silver grey
#declare RAL_7002 = rgb CLab2RGB_D65(<54.51, -0.09, 10.69>); // Olivgrau          // Olive grey
#declare RAL_7003 = rgb CLab2RGB_D65(<52.32, -1.18,  6.92>); // Moosgrau          // Moss grey
#declare RAL_7004 = rgb CLab2RGB_D65(<63.83,  0.19, -0.44>); //*Signalgrau        // Signal grey
#declare RAL_7005 = rgb CLab2RGB_D65(<50.00, -1.55,  0.82>); // Mausgrau          // Mouse grey
#declare RAL_7006 = rgb CLab2RGB_D65(<48.53,  2.15,  7.57>); // Beigegrau         // Beige grey

#declare RAL_7008 = rgb CLab2RGB_D65(<45.91,  3.34, 17.92>); // Khakigrau         // Khaki grey
#declare RAL_7009 = rgb CLab2RGB_D65(<43.19, -2.43,  3.87>); // Gr�ngrau          // Green grey
#declare RAL_7010 = rgb CLab2RGB_D65(<38.44, -2.33,  2.59>); //*Zeltgrau          // Tarpaulin grey
#declare RAL_7011 = rgb CLab2RGB_D65(<41.52, -1.68, -2.72>); // Eisengrau         // Iron grey
#declare RAL_7012 = rgb CLab2RGB_D65(<44.34, -1.77, -1.71>); // Basaltgrau        // Basalt grey
#declare RAL_7013 = rgb CLab2RGB_D65(<39.21,  0.59,  6.33>); // Braungrau         // Brown grey

#declare RAL_7015 = rgb CLab2RGB_D65(<40.50, -0.25, -3.40>); // Schiefergrau      // Slate grey
#declare RAL_7016 = rgb CLab2RGB_D65(<25.93, -1.85, -3.40>); //*Anthrazitgrau     // Anthracite grey

#declare RAL_7021 = rgb CLab2RGB_D65(<30.65, -0.43, -1.22>); // Schwarzgrau       // Black grey
#declare RAL_7022 = rgb CLab2RGB_D65(<37.75, -0.07,  2.23>); // Umbragrau         // Umbra grey
#declare RAL_7023 = rgb CLab2RGB_D65(<55.60, -1.45,  4.52>); // Betongrau         // Concrete grey
#declare RAL_7024 = rgb CLab2RGB_D65(<36.97, -0.13, -3.32>); // Graphitgrau       // Graphite grey

#declare RAL_7026 = rgb CLab2RGB_D65(<27.43, -4.01, -3.11>); //*Granitgrau        // Granite grey

#declare RAL_7030 = rgb CLab2RGB_D65(<61.31, -0.26,  4.53>); // Steingrau         // Stone grey
#declare RAL_7031 = rgb CLab2RGB_D65(<47.83, -2.96, -4.01>); // Blaugrau          // Blue grey
#declare RAL_7032 = rgb CLab2RGB_D65(<73.39, -0.93,  8.09>); // Kieselgrau        // Pebble grey
#declare RAL_7033 = rgb CLab2RGB_D65(<56.78, -3.36,  6.32>); // Zementgrau        // Cement grey
#declare RAL_7034 = rgb CLab2RGB_D65(<56.86,  0.03, 14.83>); //*Gelbgrau          // Yelow grey
#declare RAL_7035 = rgb CLab2RGB_D65(<81.29, -1.24,  0.79>); // Lichtgrau         // Light grey
#declare RAL_7036 = rgb CLab2RGB_D65(<63.49,  1.27,  0.78>); // Platingrau        // Platinum grey
#declare RAL_7037 = rgb CLab2RGB_D65(<55.30, -0.46,  0.22>); // Staubgrau         // Dust grey
#declare RAL_7038 = rgb CLab2RGB_D65(<72.97, -1.50,  2.97>); // Achatgrau         // Agate grey
#declare RAL_7039 = rgb CLab2RGB_D65(<43.50,  0.37,  5.56>); //*Quarzgrau         // Quartz grey
#declare RAL_7040 = rgb CLab2RGB_D65(<66.63, -1.17, -2.82>); // Fenstergrau       // Window grey

#declare RAL_7042 = rgb CLab2RGB_D65(<62.58, -1.51, -0.21>); // Verkehrsgrau A    // Traffic grey A
#declare RAL_7043 = rgb CLab2RGB_D65(<40.23, -1.28,  0.00>); // Verkehrsgrau B    // Traffic grey B
#declare RAL_7044 = rgb CLab2RGB_D65(<74.66, -0.04,  5.08>); // Seidengrau        // Silk grey
#declare RAL_7045 = rgb CLab2RGB_D65(<60.35, -1.43, -1.84>); //*Telegrau 1        // Telegrey 1
#declare RAL_7046 = rgb CLab2RGB_D65(<57.75, -1.60, -3.00>); // Telegrau 2        // Telegrey 2
#declare RAL_7047 = rgb CLab2RGB_D65(<81.43,  0.01,  0.10>); // Telegrau 4        // Telegrey 4
#declare RAL_7048 = rgb CLab2RGB_D65(<54.55, -0.45,  7.59>); // Perlmausgrau      // Pearl mouse grey

// RAL 8xxx - BROWN TONES

#declare RAL_8000 = rgb CLab2RGB_D65(<49.48,  5.14, 28.64>); // Gr�nbraun         // Green brown
#declare RAL_8001 = rgb CLab2RGB_D65(<47.08, 18.95, 39.87>); //*Ockerbraun        // Ochre brown
#declare RAL_8002 = rgb CLab2RGB_D65(<41.88, 14.45, 13.31>); // Signalbraun       // Signal brown
#declare RAL_8003 = rgb CLab2RGB_D65(<42.56, 15.59, 21.67>); // Lehmbraun         // Clay brown
#declare RAL_8004 = rgb CLab2RGB_D65(<43.78, 22.83, 20.22>); // Kupferbraun       // Copper brown

#declare RAL_8007 = rgb CLab2RGB_D65(<38.99, 12.62, 17.08>); // Rehbraun          // Fawn brown
#declare RAL_8008 = rgb CLab2RGB_D65(<35.15, 13.22, 28.50>); //*Olivbraun         // Olive brown

#declare RAL_8011 = rgb CLab2RGB_D65(<33.98, 10.04, 10.97>); // Nussbraun         // Nut brown
#declare RAL_8012 = rgb CLab2RGB_D65(<34.39, 17.06, 10.17>); // Rotbraun          // Red brown

#declare RAL_8014 = rgb CLab2RGB_D65(<31.99,  4.77,  7.71>); // Sepiabraun        // Sepia brown
#declare RAL_8015 = rgb CLab2RGB_D65(<33.52, 15.02,  9.25>); // Kastanienbraun    // Chestnut brown
#declare RAL_8016 = rgb CLab2RGB_D65(<21.40, 14.37, 13.84>); //*Mahagonibraun     // Mahogany brown
#declare RAL_8017 = rgb CLab2RGB_D65(<30.60,  5.99,  4.34>); // Schokoladen-braun // Chocolate brown

#declare RAL_8019 = rgb CLab2RGB_D65(<31.46,  2.12,  1.10>); // Graubraun         // Grey brown

#declare RAL_8022 = rgb CLab2RGB_D65(<25.08,  1.18,  0.67>); // Schwarzbraun      // Black brown
#declare RAL_8023 = rgb CLab2RGB_D65(<49.37, 24.91, 30.25>); // Orangebraun       // Orange brown
#declare RAL_8024 = rgb CLab2RGB_D65(<38.04, 14.14, 20.82>); //*Beigebraun        // Beige brown
#declare RAL_8025 = rgb CLab2RGB_D65(<44.00,  7.95, 11.73>); // Blassbraun        // Pale brown

#declare RAL_8028 = rgb CLab2RGB_D65(<34.19,  5.72,  8.58>); // Terrabraun        // Terra brown
#declare RAL_8029 = rgb CLab2RGB_D65(<35.06, 25.58, 27.32>); // Perlkupfer        // Pearl copper

// RAL 9xxx - WHITE AND BLACK TONES

#declare RAL_9001 = rgb CLab2RGB_D65(<90.40,  0.66,  6.64>); // Cremewei�         // Cream
#declare RAL_9002 = rgb CLab2RGB_D65(<85.07, -1.04,  5.18>); //*Grauwei�          // Grey white
#declare RAL_9003 = rgb CLab2RGB_D65(<94.13, -0.55,  0.81>); // Signalwei�        // Signal white
#declare RAL_9004 = rgb CLab2RGB_D65(<28.66,  0.24, -0.66>); // Signalschwarz     // Signal black
#declare RAL_9005 = rgb CLab2RGB_D65(<25.33,  0.13, -0.16>); // Tiefschwarz       // Jet black
#declare RAL_9006 = rgb CLab2RGB_D65(<67.77, -0.58,  0.76>); // Wei�aluminium     // White aluminium
#declare RAL_9007 = rgb CLab2RGB_D65(<55.55, -0.06,  2.14>); //*Graualuminium     // Grey aluminium

#declare RAL_9010 = rgb CLab2RGB_D65(<94.57, -0.47,  4.14>); // Reinwei�          // Pure white
#declare RAL_9011 = rgb CLab2RGB_D65(<26.54, -0.05, -1.13>); // Graphitschwarz    // Graphite black

#declare RAL_9016 = rgb CLab2RGB_D65(<95.26, -0.76,  2.11>); // Verkehrswei�      // Traffic white
#declare RAL_9017 = rgb CLab2RGB_D65(<27.25,  0.44,  0.51>); // Verkehrsschwarz   // Traffic black
#declare RAL_9018 = rgb CLab2RGB_D65(<81.34, -2.29,  2.96>); //*Papyruswei�       // Papyrus white

#declare RAL_9022 = rgb CLab2RGB_D65(<65.38, -0.43,  0.34>); // Perlhellgrau      // Pearl light grey
#declare RAL_9023 = rgb CLab2RGB_D65(<57.32, -0.31, -0.98>); // Perldunkelgrau    // Pearl dark grey

// RAL F9 COLOURS (Deutsche Bundeswehr)

//#declare RAL_6031 = rgb CLab2RGB_D65(<?????, ?????, ?????>); // Bronzegr�n
//#declare RAL_8027 = rgb CLab2RGB_D65(<?????, ?????, ?????>); // Lederbraun
//#declare RAL_9021 = rgb CLab2RGB_D65(<?????, ?????, ?????>); // Teerschwarz

//#declare RAL_1039 = rgb CLab2RGB_D65(<?????, ?????, ?????>); // Sandbeige
//#declare RAL_1040 = rgb CLab2RGB_D65(<?????, ?????, ?????>); // Lehmbeige
//#declare RAL_6040 = rgb CLab2RGB_D65(<?????, ?????, ?????>); // Helloliv
//#declare RAL_7050 = rgb CLab2RGB_D65(<?????, ?????, ?????>); // Tarngrau
//#declare RAL_8031 = rgb CLab2RGB_D65(<?????, ?????, ?????>); // Sandbraun

// OBSOLETED RAL COLOURS (no longer part of official RAL colour collection)

//#declare RAL_4000 = rgb CLab2RGB_D65(<?????, ?????, ?????>); // (Violett)
//#declare RAL_7018 = rgb CLab2RGB_D65(<?????, ?????, ?????>); // (Blaugrau)
//#declare RAL_7027 = rgb CLab2RGB_D65(<?????, ?????, ?????>); // (Grau)
//#declare RAL_7028 = rgb CLab2RGB_D65(<?????, ?????, ?????>); // (Dunkelgelb)
//#declare RAL_8020 = rgb CLab2RGB_D65(<?????, ?????, ?????>); // (Gelbbraun)

#version Colors_Ral_Inc_Temp;
#end
`,
    'consts.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: consts.inc
//    Last updated: 2001.8.12
//    Description: Various constants and alias definitions.

#ifndef(Consts_Inc_Temp)
#declare Consts_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
    #debug "including consts.inc\\n"
#end

#declare e = exp(1);//2.71828182845904523536028747135266249775724709369996;

#declare o = < 0, 0, 0>;
#declare xy = < 1, 1, 0>;
#declare yz = < 0, 1, 1>;
#declare xz = < 1, 0, 1>;

// MAP_TYPE CONSTANTS
#declare Plane_Map    = 0;
#declare Sphere_Map   = 1;
#declare Cylinder_Map = 2;
#declare Torus_Map    = 5;

// INTERPOLATION TYPE CONSTANTS
#declare Bi           = 2;
#declare Norm         = 4;

// FOG TYPE CONSTANTS
#declare Uniform_Fog = 1;
#declare Ground_Fog  = 2;

// FOCAL BLUR HEXGRID CONSTANTS
#declare Hex_Blur1    = 7;
#declare Hex_Blur2    = 19;
#declare Hex_Blur3    = 37;

// Dispersion amount constants
//Glass: 1.01 - 1.05
#declare Quartz_Glass_Dispersion = 1.012;
#declare Water_Dispersion = 1.007;
#declare Diamond_Dispersion = 1.035;
#declare Sapphire_Dispersion = 1.015;

// INDEX OF REFRACTION CONSTANTS
// Defines a few Index of Refractions for various materials for sodium light.
// Source: College Physics by Arthur L. Kimball, PhD. 4th Edition (1923)
// ---------------------------
#declare Flint_Glass_Ior = 1.71;
#declare Crown_Glass_Ior = 1.51;
#declare Diamond_Ior     = 2.47;
#declare Water_Ior       = 1.33;
#declare Air_Ior         = 1.000292;

#declare Ice_Ior = 1.31;
#declare Fluorite_Ior = 1.434;
#declare Plexiglas_Ior = 1.5;
#declare Gypsum_Ior =1.525;
#declare Salt_Ior = 1.544;

#declare Quartz_Ior = 1.550;
#declare Citrine_Ior = 1.550;
#declare Amethyst_Ior = 1.550;

#declare Beryl_Ior = 1.575;
#declare Aquamarine_Ior = 1.575;
#declare Emerald_Ior = 1.575;

#declare Topaz_Ior = 1.620;
#declare Apatite_Ior = 1.635;
#declare Tourmaline_Ior = 1.650;

#declare Corundum_Ior = 1.765;
#declare Ruby_Ior = 1.765;
#declare Sapphire_Ior = 1.765;

#declare Quartz_Glass_Ior = 1.458;
#declare Flint_Glass_Heavy_Ior = 1.8;
#declare Flint_Glass_Medium_Ior = 1.63;
#declare Flint_Glass_Light_Ior = 1.6;



// POV-Ray 3.1 NOTE: These are included for backwards compatibility only.
// Use the camera "angle" parameter for version 3.0 and above.
//
// Direction Vectors for various Field of View angles.
// The formula used to calculate these is:  FoV = 0.5 / tan(angle/2)
// Based on the height, (the UP vector), not width or diagonal.
// Useage:  direction <0, 0, FoV_45>
// (You will also need to adjust the location vector if you change FoV and
// want to keep the same visual distance from your scene.)
#declare FoV_15  = 7.595981;
#declare FoV_30  = 3.732166;
#declare FoV_45  = 2.414293;
#declare FoV_60  = 1.732113;
#declare FoV_75  = 1.303277;
#declare FoV_90  = 1.000046;
#declare FoV_105 = 0.767370;
#declare FoV_120 = 0.577391;
#declare FoV_135 = 0.414254;
#declare FoV_150 = 0.267991;
#declare FoV_165 = 0.131696;

// ATMOSPHERE TYPES
#declare ISOTROPIC_SCATTERING         = 1;
#declare MIE_HAZY_SCATTERING          = 2;
#declare MIE_MURKY_SCATTERING         = 3;
#declare RAYLEIGH_SCATTERING          = 4;
#declare HENYEY_GREENSTEIN_SCATTERING = 5;

#version Consts_Inc_Temp;
#end
`,
    'debug.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: debug.inc
//    Last updated: 2002.5.31
//    Description: This file contains various macros for debugging scene files.

#ifndef(DEBUG_MCR)
#declare DEBUG_MCR = true;

#declare DEBUG = yes;

#macro Debug_Inc_Stack()
    #declare View_POV_Include_Stack = 1;
#end

#macro Set_Debug(Bool) #declare DEBUG = Bool; #end

//Just a simple debug message macro, only sends message if currently debugging.
#macro Debug_Message(Str)
    #if(DEBUG = yes)
        #debug Str
    #end
#end


#macro Debug(Condition, Message)
    #if(Condition)
        #debug Message
    #end
#end
#macro Warning(Condition, Message)
    #if(Condition)
        #warning Message
    #end
#end
#macro Error(Condition, Message)
    #if(Condition)
        #error Message
    #end
#end


#end

`,
    'finish.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

#ifndef(Finish_Inc_Temp)
#declare Finish_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
#   debug "including finish.inc\\n"
#end

/*
              Persistence of Vision Raytracer Version 3.1

             Some basic finishes.  Others may be defined in
                  specific .inc files (see metals.inc).

*/

// Dull creates a large, soft highlight on the object's surface
#declare Dull = finish {specular 0.5 roughness 0.15}

// Shiny creates a small, tight highlight on the object's surface
#declare Shiny = finish {specular 1 roughness 0.001}

// Phong highlights are less "realistic" than specular, but useful
// for different effects.
// Dull creates a large, soft highlight on the object's surface
#declare Phong_Dull = finish {phong 0.5  phong_size 1}

// Shiny creates a small, tight highlight on the object's surface
#declare Phong_Shiny = finish {phong 1  phong_size 200}

// Very shiny with very tight highlights and a fair amount of reflection
#declare Glossy = finish {specular 1 roughness 0.0001 reflection 0.13}
#declare Phong_Glossy = finish {phong 1 phong_size 300 reflection 0.13}

// Luminous for shadowless skies and light_sources.
#declare Luminous = finish {ambient 1  diffuse 0}

// a perfectly mirrored finish with no highlights
#declare Mirror = finish {ambient 0  diffuse 0 reflection 1}

#version Finish_Inc_Temp;
#end
`,
    'functions.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File

#ifndef(Functions_Inc_Temp)
#declare Functions_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
#   debug "including function.inc\\n"
#end

/*
              Persistence of Vision Raytracer Version 3.5
            Many pre-defined functions for use in scene files.
*/

#declare f_algbr_cyl1 = function { internal(0) }
// Parameters: x, y, z 
    // Five extra parameters required:
    // 1. Field Strength 
    // 2. Field Limit 
    // 3. SOR Switch 
    // 4. SOR Offset 
    // 5. SOR Angle

#declare f_algbr_cyl2 = function { internal(1) }
// Parameters: x, y, z
    // Five extra parameters required:
    // 1. Field Strength 
    // 2. Field Limit 
    // 3. SOR Switch 
    // 4. SOR Offset 
    // 5. SOR Angle 
    
#declare f_algbr_cyl3 = function { internal(2) }
// Parameters: x, y, z
    // Five extra parameters required:
    // 1. Field Strength 
    // 2. Field Limit 
    // 3. SOR Switch 
    // 4. SOR Offset 
    // 5. SOR Angle 
    
#declare f_algbr_cyl4 = function { internal(3) }
// Parameters: x, y, z 
    // Five extra parameters required:
    // 1. Field Strength 
    // 2. Field Limit 
    // 3. SOR Switch 
    // 4. SOR Offset 
    // 5. SOR Angle 
    
#declare f_bicorn = function { internal(4) }
// Parameters: x, y, z 
    // Two extra parameters required:
    // 1. Field Strength 
    // 2. Scale. The surface is always the same shape. 
    //           Changing this parameter has the same effect as adding a scale modifier.
    //           Setting the scale to 1 gives a surface with a radius of about 1 unit.

#declare f_bifolia = function { internal(5) }
// Parameters: x, y, z 
    // Two extra parameters required:
    // 1. Field Strength 
    // 2. Scale. The mathematics of this surface suggest that the shape 
    //           should be different for different values of this parameter. 
    //           In practice the difference in shape is hard to spot. 
    //           Setting the scale to 3 gives a surface with a radius of about 1 unit.

#declare f_blob = function { internal(6) }
// Parameters: x, y, z 
    // Five extra parameters required:
    // 1. x distance between the two components 
    // 2. blob strength of component 1 
    // 3. inverse blob radius of component 1 
    // 4. blob strength of component 2 
    // 5.inverse blob radius of component 2
    
#declare f_blob2 = function { internal(7) }
// Parameters: x, y, z
    //Four extra parameters required: 
    // 1. Separation. One blob component is at the origin 
    //    and the other is this distance away on the x axis 
    // 2. inverse size. Increase this to decrease the size of the surface 
    // 3. blob strength 
    // 4. threshold. Setting this parameter to 1 
    //    and the threshold to zero has exactly the same effect
    //    as setting this parameter to zero and the threshold to -1

#declare f_boy_surface = function { internal(8) }
// Parameters: x, y, z 
    // Two extra parameters required:
    // 1. Field Strength 
    // 2. Scale. The surface is always the same shape. 
    //    Changing this parameter has the same effect as adding a scale modifier
    
#declare f_comma = function { internal(9) }
// Parameters: x, y, z
    // One extra parameter required: 
    // 1. scale

#declare f_cross_ellipsoids = function { internal(10) }
// Parameters: x, y, z 
    // Four extra paraameters required
    // 1. eccentricity. When less than 1, 
    //    the ellipsoids are oblate, 
    //    when greater than 1 the ellipsoids are prolate,
    //    when zero the ellipsoids are spherical 
    //    (and hence the whole surface is a sphere) 
    // 2. inverse size. Increase this to decrease the size of the surface 
    // 3. Diameter. Increase this to increase the size of the ellipsoids 
    // 4. threshold. Setting this parameter to 1 and the threshold to zero 
    //    has exactly the same effect as setting this parameter to zero 
    //    and the threshold to -1

#declare f_crossed_trough = function { internal(11) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1.  Field Strength 
    
#declare f_cubic_saddle = function { internal(12) }
// Parameters: x, y, z
    // One extra parameter required:
    // 1. Field Strength

#declare f_cushion = function { internal(13) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength
    
#declare f_devils_curve = function { internal(14) }
// Parameters: x, y, z
    // One extra parameter required:
    // 1. Field Strength
    
#declare f_devils_curve_2d = function { internal(15) }
// Parameters: x, y, z 
    // Six extra parameters required:
    // 1. Field Strength 
    // 2. X factor 
    // 3. Y factor 
    // 4. SOR Switch 
    // 5. SOR Offset 
    // 6. SOR Angle
    
#declare f_dupin_cyclid = function { internal(16) }
// Parameters: x, y, z 
    // Six extra parameters required:
    // 1. Field Strength 
    // 2. Major radius of torus 
    // 3. Minor radius of torus 
    // 4. X displacement of torus 
    // 5. Y displacement of torus 
    // 6. Radius of inversion

#declare f_ellipsoid = function { internal(17) }
// Parameters: x, y, z 
    // Three extra parameters required:
    // 1. x scale (inverse) 
    // 2. y scale (inverse) 
    // 3. z scale (inverse)

#if (Functions_Inc_Temp < 3.8)
    #declare deprecated once "f_enneper was broken prior to v3.8; results will most likely differ."
             f_enneper = function { internal(18) }
#else
    #declare f_enneper = function { internal(18) }
#end
// Parameters: x, y, z
    // One extra parameter required: 
    // 1. Field strength
    
#declare f_flange_cover = function { internal(19) }
// Parameters: x, y, z 
    // Four extra parameters required:
    // 1. Spikiness. Set this to very low values to increase the spikes. 
    //    Set it to 1 and you get a sphere 
    // 2. inverse size. Increase this to decrease the size of the surface. 
    //    (The other parameters also drastically affect the size, 
    //     but this parameter has no other effects) 
    // 3. Flange. Increase this to increase the flanges that appear between the spikes. Set it to 1 for no flanges 
    // 4. threshold. Setting this parameter to 1 and the threshold to zero
    //    has exactly the same effect as setting this parameter to zero 
    //    and the threshold to -1
    
#declare f_folium_surface = function { internal(20) }
// Parameters: x, y, z 
    // Three extra parameters required:
    // 1. Field Strength 
    // 2. Neck width factor - 
    //    the larger you set this, 
    //    the narrower the neck where the paraboloid meets the plane 
    // 3. Divergence - 
    //    the higher you set this value, the wider the paraboloid gets

#declare f_folium_surface_2d = function { internal(21) }
// Parameters: x, y, z 
    // Six extra parameters required:
    // 1. Field Strength 
    // 2. Neck width factor - same as the 3d surface if you're revolving it around the Y axis 
    // 3. Divergence - 
    //    same as the 3d surface if you're revolving it around the Y axis 
    // 4. SOR Switch 
    // 5. SOR Offset 
    // 6. SOR Angle

#declare f_glob = function { internal(22) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength
    
#declare f_heart = function { internal(23) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength
    
#declare f_helical_torus = function { internal(24) }
// Parameters: x, y, z
    // Ten extra parameters required: 
    // 1.Major radius 
    // 2. Number of winding loops 
    // 3. Twistiness of winding. 
    //    When zero, each winding loop is separate. 
    //    When set to one, each loop twists into the next one. 
    //    When set to two, each loop twists into the one after next 
    // 4. Fatness of winding? 
    // 5. threshold. Setting this parameter to 1 and the threshold to zero 
    //    has s similar effect as setting this parameter to zero 
    //    and the threshold to 1 
    // 6. Negative minor radius? Reducing this parameter 
    //    increases the minor radius of the central torus. 
    //    Increasing it can make the torus disappear 
    //    and be replaced by a vertical column. 
    //    The value at which the surface switches 
    //    from one form to the other depends on several other parameters 
    // 7. Another fatness of winding control? 
    // 8. Groove period. Increase this for more grooves 
    // 9. Groove amplitude. Increase this for deeper grooves 
    // 10. Groove phase. Set this to zero for symmetrical grooves

#declare f_helix1 = function { internal(25) }
// Parameters: x, y, z 
// Parameters: x, y, z
    // Seven extra parameters required: 
    // 1. Number of helixes - e.g. 2 for a double helix 
    // 2. Period - is related to the number of turns per unit length 
    // 3. Minor radius 
    // 4. Major radius 
    // 5. Shape parameter. If this is greater than 1 then the tube becomes fatter in the y direction 
    // 6. Cross section type. 
    // 7. Cross section rotation angle (degrees). E.g. if you choose a square cross section and rotate it by 45 degrees you get a diamond cross section.
#declare f_helix2 = function { internal(26) }
    // Parameters: x, y, z
    // Seven extra parameters required: 
    // 1. Not used 
    // 2. Period - is related to the number of turns per unit length 
    // 3. Minor radius 
    // 4. Major radius 
    // 5. Not used 
    // 6. Cross section type. 
    // 7. Cross section rotation angle (degrees). E.g. if you choose a square cross section and rotate it by 45 degrees you get a diamond cross section.

#declare f_hex_x = function { internal(27) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Has no effect  ??????????????????????????????
     
#declare f_hex_y = function { internal(28) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Has no effect  ??????????????????????????????
    
#declare f_hetero_mf = function { internal(29) }
// Parameters: x, y, z 
    // Six extra parameters required:
    // 1. H 
    // 2. lacunarity 
    // 3. octaves 
    // 4. offset 
    // 5. T  
    // 6. noise
    
#declare f_hunt_surface = function { internal(30) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength
#declare f_hyperbolic_torus = function { internal(31) }
// Parameters: x, y, z 
    // Three extra parameters required:
    // 1. Field strength 
    // 2. Major radius: separation between the centers of the tubes at the closest point 
    // 3. Minor radius: thickness of the tubes at the closest point 
    
#declare f_isect_ellipsoids = function { internal(32) }
// Parameters: x, y, z
    // Four extra parameters required:
    // 1. eccentricity. When less than 1, the ellipsoids are oblate, 
    //    when greater than 1 the ellipsoids are prolate, 
    //    when zero the ellipsoids are spherical 
    //   (and hence the whole surface is a sphere) 
    // 2. inverse size. Increase this to decrease the size of the surface 
    // 3. Diameter. Increase this to increase the size of the ellipsoids 
    // 4. threshold. Setting this parameter to 1 and the threshold to zero 
    //    has exactly the same effect as setting this parameter to zero 
    //    and the threshold to -1

#declare f_kampyle_of_eudoxus = function { internal(33) }
// Parameters: x, y, z
    // Three extra parameters required:
    // 1. Field strength 
    // 2. Dimple: When zero, the two dimples punch right through 
    //    and meet at the center. Non-zero values give less dimpling 
    // 3. Closeness: Higher values make the two planes become closer 
    
#declare f_kampyle_of_eudoxus_2d = function { internal(34) }
// Parameters: x, y, z 
    // Six extra parameters required:
    // 1. Field strength 
    // 2. Dimple: When zero, the two dimples punch right through and meet at the center. Non-zero values give less dimpling 
    // 3. loseness: Higher values make the two planes become closer 
    // 4. sor switch 
    // 5. sor offset 
    // 6. sor angle 

#declare f_klein_bottle = function { internal(35) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength

#declare f_kummer_surface_v1 = function { internal(36) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength
    
#declare f_kummer_surface_v2 = function { internal(37) }
// Parameters: x, y, z 
    // Four extra parameters required:
    // 1. Field strength 
    // 2. Rod width (negative): Setting this parameter 
    //    to larger negative values increases the diameter of the rods 
    // 3. Divergence (negative): Setting this number to -1 
    //    causes the rods to become approximately cylindrical. 
    //    Larger negative values cause the rods to become fatter further from the origin. 
    //    Smaller negative numbers cause the rods to become narrower away from the origin,
    //    and have a finite length 
    // 4. Influences the length of half of the rods. 
    //    Changing the sign affects the other half of the rods. 
    //    0 has no effect 
    
#declare f_lemniscate_of_gerono = function { internal(38) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength
    
#declare f_lemniscate_of_gerono_2d = function { internal(39) }
// Parameters: x, y, z
    // Six extra parameters required: 
    // 1. Field strength 
    // 2. size: increasing this makes the 2d curve larger and less rounded 
    // 3. width: increasing this makes the 2d curve fatter 
    // 4. sor switch 
    // 5. sor offset 
    // 6. sor angle
    
#declare f_mesh1 = function { internal(40) }
// Parameters: x, y, z 
    // Five extra Parameters required: 
    // 1. Distance between neighboring threads in the x direction 
    // 2. Distance between neighboring threads in the z direction 
    // 3. Relative thickness in the x and z directions 
    // 4. Amplitude of the weaving effect. Set to zero for a flat grid 
    // 5. Relative thickness in the y direction 
    
#declare f_mitre = function { internal(41) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength 
    
#declare f_nodal_cubic = function { internal(42) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength 
    
#declare f_odd = function { internal(43) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength
    
#declare f_ovals_of_cassini = function { internal(44) }
// Parameters: x, y, z 
    // Four parameters required:
    // 1. Field Strength 
    // 2. Major radius - like the major radius of a torus 
    // 3. Filling. Set this to zero, and you get a torus. Set this to a higher value and the hole in the middle starts to heal up. Set it even higher and you get an ellipsoid with a dimple 
    // 4. Thickness. The higher you set this value, the plumper is the result.

#declare f_paraboloid = function { internal(45) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength
    
#declare f_parabolic_torus = function { internal(46) }
// Parameters: x, y, z 
    // Tree extra parameters required:
    // 1. Field Strength 
    // 2. Major radius 
    // 3. Minor radius
        
#declare f_ph = function { internal(47) }
// Parameters: x, y, z 
    // no extra parameters required

#declare f_pillow = function { internal(48) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength
    
#declare f_piriform = function { internal(49) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength
    
#declare f_piriform_2d = function { internal(50) }
// Parameters: x, y, z 
    // Seven extra parameters required:
    // 1. Field strength 
    // 2. size factor 1: increasing this makes the curve larger 
    // 3. size factor 2: making this less negative makes the curve larger but also thinner 
    // 4. Fatness: increasing this makes the curve fatter 
    // 5. sor switch 
    // 6. sor offset 
    // 7. sor angle

#declare f_poly4 = function { internal(51) }
// Parameters: x, y, z 
    // Five extra parameters required:
    // 1. Constant 
    // 2. y coefficient 
    // 3. Y2 coefficient 
    // 4. Y3 coefficient 
    // 5. Y4 coefficient
    
#declare f_polytubes = function { internal(52) }
// Parameters: x, y, z
    // Six extra parameters required: 
    // 1. Number of tubes 
    // 2. Constant 
    // 3. y coefficient 
    // 4. Y2 coefficient 
    // 5. Y3 coefficient 
    // 6. Y4 coefficient
    
#declare f_quantum = function { internal(53) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Has no effect  ??????????????????????????????
    
#declare f_quartic_paraboloid = function { internal(54) }
// Parameters: x, y, z
    // One extra parameter required:
    // 1. Field Strength 
    
#declare f_quartic_saddle = function { internal(55) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength
    
#declare f_quartic_cylinder = function { internal(56) }
// Parameters: x, y, z 
    // Three extra parameters required:
    // 1. Field strength 
    // 2. Diameter of the "egg" 
    // 3. Controls the width of the tube and the vertical scale of the "egg"

#declare f_r = function { internal(57) }
// Parameters: x, y, z 
    // no extra parameters required
    
#declare f_ridge = function { internal(58) }
// Parameters: x, y, z 
    // Six extra parameters required:
    // 1.lambda 
    // 2. octaves 
    // 3. omega 
    // 4. offset 
    // 5. Ridge
    // 6. noise
    
#declare f_ridged_mf = function { internal(59) }
// Parameters: x, y, z
    // Six extra parameters required:                          
    // 1. H 
    // 2. Lacunarity 
    // 3. octaves
    // 4. offset 
    // 5. Gain 
    // 6. noise
    
#declare f_rounded_box = function { internal(60) }
// Parameters: x, y, z, P0, P1, P2, P3
    // Four extra parameters required:
    // 1. Radius of curvature. 
    //    Zero gives square corners, 
    //    0.1 gives corners that match "sphere {0,0.1}"
    // 2. scale x
    // 3. scale y
    // 4. scale z
    
#declare f_sphere = function { internal(61) }
// Parameters: x, y, z  
    //One extra parameter required: 
    // 1. radius of sphere
    
#declare f_spikes = function { internal(62) }
// Parameters: x, y, z 
    // Five extra parameters required:
    // 1. Spikiness. Set this to very low values to increase the spikes. 
    //    Set it to 1 and you get a sphere 
    // 2. Hollowness. Increasing this causes the sides to bend in more 
    // 3. size. Increasing this increases the size of the object 
    // 4. Roundness. This parameter has a subtle effect on the roundness of the spikes 
    // 5. Fatness. Increasing this makes the spikes fatter
    
#declare f_spikes_2d = function { internal(63) }
// Parameters: x, y, z 
    // Four extra parameters required:
    // 1. Height of central spike 
    // 2. frequency of spikes in the x direction 
    // 3. frequency of spikes in the z direction 
    // 4. Rate at which the spikes reduce as you move away from the center 

#declare f_spiral = function { internal(64) }
// Parameters: x, y, z 
    // Six extra parameters required:
    // 1. Distance between windings: setting this to 0.3 means that the spiral is 0.3 pov units further from the origin each time it completes one whole turn 
    // 2. Thickness 
    // 3. Outer diameter of the spiral. The surface behaves as if it is contained_by a sphere of this diameter 
    // 4. Not used 
    // 5. Not used 
    // 6. Cross section type

#declare f_steiners_roman = function { internal(65) }
// Parameters: x, y, z
    // One extra parameter required:
    // 1. Field Strength 
    
#declare f_strophoid = function { internal(66) }
// Parameters: x, y, z
    // Four extra parameters required: 
    // 1. Field strength 
    // 2. size of bulb. Larger values give larger bulbs. 
    //    Negative values give a bulb on the other side of the plane 
    // 3. Sharpness. When zero, the bulb is like a sphere that just touches the plane. 
    //    When positive, there is a crossover point. 
    //    When negative the bulb simply bulges out of the plane like a pimple 
    // 4. Fatness. Higher values make the top end of the bulb fatter

#declare f_strophoid_2d = function { internal(67) }
// Parameters: x, y, z
    // Seven extra parameters required: 
    // 1. Field strength 
    // 2. size of bulb. Larger values give larger bulbs. 
    //    Negative values give a bulb on the other side of the plane 
    // 3. Sharpness. When zero, the bulb is like a sphere that just touches the plane. 
    //    When positive, there is a crossover point. 
    //    When negative the bulb simply bulges out of the plane like a pimple 
    // 4. Fatness. Higher values make the top end of the bulb fatter 
    // 5. sor switch 
    // 6. sor offset 
    // 7. sor angle
    
#declare f_superellipsoid = function { internal(68) }
// Parameters: x, y, z 
    // two extra parameters required:
    // 1. NW 
    // 2. SW
    
#declare f_th = function { internal(69) }
// Parameters: x, y, z 
    // no extra parameters required
    
#declare f_torus = function { internal(70) }
// Parameters: x, y, z
    // two extra parameters required:
    // 1. Major radius 
    // 2. Minor radius
    
#declare f_torus2 = function { internal(71) }
// Parameters: x, y, z
    // Three extra parameters required:
    // 1. Field strength 
    // 2. Major radius 
    // 3. Minor radius

#declare f_torus_gumdrop = function { internal(72) }
// Parameters: x, y, z 
    // One extra parameter required:
    // 1. Field Strength

#declare f_umbrella = function { internal(73) }
// Parameters: x, y, z
    // One extra parameter required:
    // 1. Field Strength 
#declare f_witch_of_agnesi = function { internal(74) }
// Parameters: x, y, z
    // Two extra parameters required:
    // 1. Field Strength
    // 2. Controls the width of the spike. 
    //    The height of the spike is always about 1 unit

#declare f_witch_of_agnesi_2d = function { internal(75) }
// Parameters: x, y, z 
    // Six extra parameters required:
    // 1. Field strength 
    // 2. Controls the size of the spike 
    // 3. Controls the height of the spike 
    // 4. sor switch 
    // 5. sor offset 
    // 6. sor angle

#declare f_noise3d = function { internal(76) }
// Parameters: x, y, z
//Noise in the range [-1, 1]
#declare f_snoise3d = function {2*f_noise3d(x, y, z) - 1}
// Parameters: x, y, z

#declare f_noise_generator = function { internal(78) }
// Parameters: x, y, z
    // One extra parameter required:
    // 1. noise_generator number


#macro eval_pigment(pigm, vec)
    #local fn = function { pigment { pigm } }
    #local result = (fn(vec.x, vec.y, vec.z));
    result
#end


// Isosurface pattern functions
// Some of these are not implemented because they require special
// parameters that must be specified in the definition. For this
// reason, you probably would want to define your own versions of
// these functions.
#declare f_agate = function {pattern {agate}}
// average not implemented
#declare f_boxed = function {pattern {boxed}}
#declare f_bozo = function {f_noise3d(x, y, z)}
#declare f_brick = function {pattern {brick}}
#declare f_bumps = function {f_noise3d(x, y, z)}
#declare f_checker = function {pattern {checker}}
#declare f_crackle = function {pattern {crackle}}
#declare f_cylindrical = function {pattern {cylindrical}}
// density_file not implemented
#declare f_dents = function {pow(f_noise3d(x, y, z), 3)}
#declare f_gradientX = function {pattern {gradient x}}
#declare f_gradientY = function {pattern {gradient y}}
#declare f_gradientZ = function {pattern {gradient z}}
#declare f_granite = function {pattern {granite}}
// image_pattern not implemented
#declare f_hexagon = function {pigment {hexagon color rgb 0, color rgb 0.5, color rgb 1}}
#declare f_leopard = function {pattern {leopard}}
//only the basic mandel pattern is implemented, its variants and
//the other fractal patterns are not implemented.
#declare f_mandel = function {pattern {mandel 25}}
#declare f_marble = function {pattern {marble}}
// object not implemented
#declare f_onion = function {pattern {onion}}
// pigment_pattern not implemented
#declare f_planar = function {pattern {planar}}
// quilted not implemented
#declare f_radial = function {pattern {radial}}
#declare f_ripples = function {pattern {ripples}}
#declare f_spherical = function {pattern {spherical}}
#declare f_spiral1 = function {pattern {spiral1 2}}
#declare f_spiral2 = function {pattern {spiral2 2}}
#declare f_spotted = function {f_noise3d(x, y, z)}
#declare f_waves = function {pattern {waves}}
#declare f_wood = function {pattern {wood}}
#declare f_wrinkles = function {pattern {wrinkles}}


// Waveform functions
#declare f_sine_wave = function {sin(x*z*pi)*y}
    // f_sine_wave(val, amplitude, frequency)
#declare f_scallop_wave = function {abs(sin(x*z*pi)*y)}
    // f_scallop_wave(val, amplitude, frequency)

#version Functions_Inc_Temp;
#end//functions.inc

`,
    'glass.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: glass.inc
//    Last updated: 2001.8.19
//	   Author: Christoph Hormann
//    Description: Glass materials using new POV 3.5 features.
//
//    Upated: 07Aug2008 (jh)
//    Use these pigments, finishes and interiors to make a glass "material"
//    Converted glass_old textures to materials.
//    See glass_old.inc for examples

#ifndef(Glass_Inc_Temp)
#declare Glass_Inc_Temp=version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
    #debug "including glass.inc\\n"
#end

#include "glass_old.inc"
#include "consts.inc"

// #### colors with transparency for use in pigment ####

// ------- colors derived from old glass.inc include file

#declare Col_Glass_Old=color rgbf <0.8, 0.9, 0.85, 0.85>;
#declare Col_Glass_Winebottle=color rgbf <0.4, 0.72, 0.4, 0.6>;
#declare Col_Glass_Beerbottle=color rgbf <0.7, 0.5, 0.1, 0.6>;
#declare Col_Glass_Ruby=color rgbf <0.9, 0.1, 0.2, 0.8>;
#declare Col_Glass_Green=color rgbf <0.8, 1, 0.95, 0.9>;
#declare Col_Glass_Dark_Green=color rgbf <0.1, 0.7, 0.8, 0.8>;
#declare Col_Glass_Yellow=color rgbf <0.8, 0.8, 0.2, 0.8>;
#declare Col_Glass_Orange=color rgbf <1.0, 0.5, 0.0, 0.8>;
#declare Col_Glass_Vicksbottle=color rgbf <0.1, 0.15, 0.5, 0.9>;

// ------- additional colors

#declare Col_Glass_Clear=color rgbf <1.0, 1.0, 1.0, 1.0>;
#declare Col_Glass_General=color rgbf <0.97, 0.99, 0.98, 0.9>;
#declare Col_Glass_Bluish=color rgbf <0.90, 0.94, 1.0, 0.8>;

// #### colors without transparency (for fade_color) ####

// ------- colors derived from old glass.inc include file

#declare Col_Winebottle=color rgb <0.4, 0.72, 0.4>;
#declare Col_Beerbottle=color rgb <0.7, 0.5, 0.1>;
#declare Col_Ruby=color rgb <0.9, 0.1, 0.2>;
#declare Col_Green=color rgb <0.8, 1, 0.95>;
#declare Col_Dark_Green=color rgb <0.1, 0.7, 0.8>;
#declare Col_Yellow=color rgb <0.8, 0.8, 0.2>;
#declare Col_Orange=color rgb <1.0, 0.5, 0.0>;
#declare Col_Vicksbottle=color rgb <0.1, 0.15, 0.5>;

// ------- additional colors

#declare Col_Red_01=color rgb <0.85, 0.10, 0.20>;
#declare Col_Red_02=color rgb <0.85, 0.35, 0.10>;
#declare Col_Red_03=color rgb <0.75, 0.20, 0.25>;
#declare Col_Red_04=color rgb <0.50, 0.10, 0.10>;

#declare Col_Green_01=color rgb <0.10, 0.85, 0.20>;
#declare Col_Green_02=color rgb <0.35, 0.85, 0.10>;
#declare Col_Green_03=color rgb <0.20, 0.75, 0.25>;
#declare Col_Green_04=color rgb <0.10, 0.50, 0.10>;

#declare Col_Blue_01=color rgb <0.35, 0.42, 0.85>;
#declare Col_Blue_02=color rgb <0.35, 0.65, 0.85>;
#declare Col_Blue_03=color rgb <0.35, 0.40, 0.75>;
#declare Col_Blue_04=color rgb <0.10, 0.10, 0.50>;

#declare Col_Yellow_01=color rgb <0.85, 0.85, 0.20>;
#declare Col_Yellow_02=color rgb <0.75, 0.78, 0.10>;
#declare Col_Yellow_03=color rgb <0.78, 0.75, 0.10>;
#declare Col_Yellow_04=color rgb <0.50, 0.50, 0.10>;

// ------- colors of common minerals

#declare Col_Amethyst_01=color rgb<0.4392, 0.1765, 0.3137>;
#declare Col_Amethyst_02=color rgb<0.5843, 0.3686, 0.4941>;
#declare Col_Amethyst_03=color rgb<0.6980, 0.5059, 0.6157>;
#declare Col_Amethyst_04=color rgb<0.9059, 0.7176, 0.8471>;
#declare Col_Amethyst_05=color rgb<0.8902, 0.4549, 0.7059>;
#declare Col_Amethyst_06=color rgb<0.4980, 0.2902, 0.4235>;

#declare Col_Apatite_01=color rgb<0.0549, 0.3451, 0.4314>;
#declare Col_Apatite_02=color rgb<0.2941, 0.5765, 0.5647>;
#declare Col_Apatite_03=color rgb<0.5176, 0.7333, 0.7020>;
#declare Col_Apatite_04=color rgb<0.3412, 0.5961, 0.4118>;
#declare Col_Apatite_05=color rgb<0.3647, 0.8196, 0.7451>;

#declare Col_Aquamarine_01=color rgb<0.5333, 0.6157, 0.6196>;
#declare Col_Aquamarine_02=color rgb<0.6627, 0.7020, 0.7255>;
#declare Col_Aquamarine_03=color rgb<0.7412, 0.8235, 0.8431>;
#declare Col_Aquamarine_04=color rgb<0.6039, 0.7216, 0.7882>;
#declare Col_Aquamarine_05=color rgb<0.5804, 0.7098, 0.7765>;
#declare Col_Aquamarine_06=color rgb<0.7255, 0.8510, 0.9176>;

#declare Col_Azurite_01=color rgb<0.2863, 0.3569, 0.7216>;
#declare Col_Azurite_02=color rgb<0.5333, 0.6549, 0.9059>;
#declare Col_Azurite_03=color rgb<0.3020, 0.3529, 0.6314>;
#declare Col_Azurite_04=color rgb<0.1137, 0.1569, 0.4471>;

#declare Col_Citrine_01=color rgb<0.3020, 0.2314, 0.1529>;
#declare Col_Citrine_02=color rgb<0.4667, 0.3804, 0.2980>;
#declare Col_Citrine_03=color rgb<0.5020, 0.4118, 0.3529>;

#declare Col_Emerald_01=color rgb<0.0471, 0.4000, 0.2549>;
#declare Col_Emerald_02=color rgb<0.2157, 0.6353, 0.4902>;
#declare Col_Emerald_03=color rgb<0.3216, 0.6627, 0.5961>;
#declare Col_Emerald_04=color rgb<0.1843, 0.4549, 0.3843>;
#declare Col_Emerald_05=color rgb<0.2863, 0.6431, 0.4431>;
#declare Col_Emerald_06=color rgb<0.2353, 0.5922, 0.3804>;
#declare Col_Emerald_07=color rgb<0.4392, 0.7725, 0.5804>;

#declare Col_Fluorite_01=color rgb<0.5098, 0.3294, 0.4039>;
#declare Col_Fluorite_02=color rgb<0.3020, 0.1569, 0.2431>;
#declare Col_Fluorite_03=color rgb<0.5098, 0.2902, 0.2745>;
#declare Col_Fluorite_04=color rgb<0.5373, 0.3098, 0.0902>;
#declare Col_Fluorite_05=color rgb<0.7020, 0.5529, 0.7294>;
#declare Col_Fluorite_06=color rgb<0.4745, 0.2627, 0.4824>;
#declare Col_Fluorite_07=color rgb<0.2314, 0.0784, 0.2902>;
#declare Col_Fluorite_08=color rgb<0.5804, 0.6235, 0.6745>;
#declare Col_Fluorite_09=color rgb<0.4392, 0.4745, 0.5333>;

#declare Col_Gypsum_01=color rgb<0.9020, 0.8824, 0.7882>;
#declare Col_Gypsum_02=color rgb<0.8039, 0.8667, 0.8157>;
#declare Col_Gypsum_03=color rgb<0.7098, 0.6863, 0.6000>;
#declare Col_Gypsum_04=color rgb<0.8275, 0.8078, 0.5765>;
#declare Col_Gypsum_05=color rgb<0.8196, 0.7373, 0.5294>;
#declare Col_Gypsum_06=color rgb<0.5961, 0.4941, 0.3020>;

#declare Col_Ruby_01=color rgb<0.4980, 0.0824, 0.2275>;
#declare Col_Ruby_02=color rgb<0.6235, 0.1490, 0.3137>;
#declare Col_Ruby_03=color rgb<0.7412, 0.3294, 0.4745>;
#declare Col_Ruby_04=color rgb<0.8039, 0.2039, 0.5569>;
#declare Col_Ruby_05=color rgb<0.5882, 0.1255, 0.4784>;

#declare Col_Sapphire_01=color rgb<0.2118, 0.3020, 0.4980>;
#declare Col_Sapphire_02=color rgb<0.0588, 0.2000, 0.5569>;
#declare Col_Sapphire_03=color rgb<0.0392, 0.2353, 0.5686>;

#declare Col_Topaz_01=color rgb<0.7333, 0.7451, 0.6980>;
#declare Col_Topaz_02=color rgb<0.5922, 0.6196, 0.5922>;
#declare Col_Topaz_03=color rgb<0.5922, 0.6157, 0.6510>;

#declare Col_Tourmaline_01=color rgb<0.3725, 0.4235, 0.2941>;
#declare Col_Tourmaline_02=color rgb<0.2745, 0.3490, 0.2235>;
#declare Col_Tourmaline_03=color rgb<0.2627, 0.2549, 0.1451>;
#declare Col_Tourmaline_04=color rgb<0.1333, 0.4706, 0.3412>;
#declare Col_Tourmaline_05=color rgb<0.0627, 0.2980, 0.2118>;
#declare Col_Tourmaline_06=color rgb<0.0196, 0.2706, 0.1961>;

#declare Col_Amber_01=color rgb<0.3725, 0.4235, 0.2941>;
#declare Col_Amber_02=color rgb<0.8941, 0.6863, 0.2902>;
#declare Col_Amber_03=color rgb<0.7412, 0.4235, 0.2588>;
#declare Col_Amber_04=color rgb<0.7059, 0.3961, 0.1216>;
#declare Col_Amber_05=color rgb<0.5647, 0.2392, 0.0745>;
#declare Col_Amber_06=color rgb<0.8157, 0.6549, 0.2392>;
#declare Col_Amber_07=color rgb<0.9882, 0.6941, 0.0431>;
#declare Col_Amber_08=color rgb<0.8549, 0.4706, 0.1294>;
#declare Col_Amber_09=color rgb<0.5294, 0.2431, 0.1529>;


// #### additional glass finishes ####

#declare F_Glass5 =
  finish {
    specular 0.7
    roughness 0.001
    ambient 0
    diffuse 0
    reflection {
      0.2, 1.0
      fresnel on
    }
    conserve_energy
  }

#declare F_Glass6 =
  finish {
    specular 0.6
    roughness 0.002
    ambient 0
    diffuse 0.1
    brilliance 5
    reflection {
      0.1, 1.0
      fresnel on
    }
    conserve_energy
  }

#declare F_Glass7 =
  finish {
    specular 0.9
    roughness 0.001
    ambient 0
    diffuse 0
    reflection {
      0.0, 1.0
      fresnel on
    }
    conserve_energy
 }

#declare F_Glass8 =
  finish {
    specular 0.6
    roughness 0.005
    ambient 0
    diffuse 0.15
    brilliance 4
    reflection {
      0.2, 1.0
      fresnel on
    }
    conserve_energy
 }

#declare F_Glass9 =
  finish {
    specular 0.8
    roughness 0.001
    ambient 0
    diffuse 0
    reflection {
      0.05, 1.0
    }
    conserve_energy
 }

#declare F_Glass10 =
  finish {
    specular 0.6
    roughness 0.002
    ambient 0
    diffuse 0.1
    reflection {
      0.05, 1.0
    }
    conserve_energy
 }


// #### additional glass interiors ####

#declare I_Glass1=
  interior {
    ior 1.5
    fade_distance 1.0
    fade_power 2
  }

#declare I_Glass2=
  interior {
    ior 1.5
    fade_distance 0.5
    fade_power 1001
  }

#declare I_Glass3=
  interior {
    ior 1.5
    fade_distance 1.0
    fade_power 1001
  }

#declare I_Glass4=
  interior {
    ior 1.5
    fade_distance 2.0
    fade_power 1001
  }

#declare I_Glass_Fade_Sqr1=interior { I_Glass1 }
#declare I_Glass_Fade_Exp1=interior { I_Glass2 }
#declare I_Glass_Fade_Exp2=interior { I_Glass3 }
#declare I_Glass_Fade_Exp3=interior { I_Glass4 }


#declare I_Glass_Dispersion1=
  interior {
    ior 1.5
    dispersion 1.02
    fade_distance 1
    fade_power 1001
  }

#declare I_Glass_Dispersion2=
  interior {
    ior 1.5
    dispersion 1.15
    fade_distance 1
    fade_power 1001
  }

#declare I_Glass_Caustics1=
  interior {
    ior 1.5
    caustics 0.5
    fade_distance 1
    fade_power 1001
  }

#declare I_Glass_Caustics2=
  interior {
    ior 1.5
    caustics 1.0
    fade_distance 1
    fade_power 1001
  }

#macro I_Glass_Exp(Distance)
  ior 1.5
  fade_distance Distance
  fade_power 1001
#end

#macro I_Glass_Sqr(Distance)
  ior 1.5
  fade_distance Distance
  fade_power 2
#end

#version Glass_Inc_Temp;
#end
`,
    'glass_old.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer Include File
//    File: glass_old.inc
//    Last updated: 2001.8.9
//    Description: Glass finishes and textures (was glass.inc in versions prior to 3.5).
//    Changes in version 3.1: moved refraction and ior to the interior statment.
//    Use I_Glass in conjunction with each of the finish statments below.
//    Version 3.5: Renamed file as glass_old.inc.
//
//    Updated: 27Sep2008(jh)
//
//    To suppress warnings generated from using these deprecated textures you should consider
//    converting them to materials.
//    
//    In this example texture {T_Glass4} interior {I_Glass caustics 1} becomes
//
//    material {
//      texture {
//        pigment { color rgbf <0.98, 1.0, 0.99, 0.75> }
//        finish { F_Glass4 }
//        }
//      interior { I_Glass caustics 1 }
//      } 

#ifndef(Glass_Old_Inc_Temp)
#declare Glass_Old_Inc_Temp=version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
    #debug "including glass_old.inc\\n"
#end

// Glass Interior
#declare I_Glass =
interior {
    ior 1.5
}
  
// Glass Finishes
#declare F_Glass1 =
finish {
    specular 1
    roughness 0.001
    ambient 0
    diffuse 0
    reflection 0.1
}   

#declare F_Glass2 = 
finish {
    ambient 0
    diffuse 0
    reflection 0.5
    phong 0.3
    phong_size 60
}

#declare F_Glass3 =
finish  {
    ambient 0.1
    diffuse 0.1
    reflection 0.1
    specular 0.8
    roughness 0.003
    phong 1
    phong_size 400
}

#declare F_Glass4 =
finish {
    ambient 0.1
    diffuse 0.1
    reflection .25
    specular 1
    roughness 0.001
}

// Glass Textures
// Simple clear glass
#declare deprecated once "See notes in glass_old.inc regarding use of this deprecated texture: T_Glass1" T_Glass1 =
texture {
    pigment { color rgbf<1.0, 1.0, 1.0, 0.7> }
    finish  { F_Glass1 }
}

// More like an acrylic plastic
#declare deprecated once "See notes in glass_old.inc regarding use of this deprecated texture: T_Glass2" T_Glass2 =
texture {
    pigment { color rgbf<1.0, 1.0, 1.0, 1.0> }
    finish  { F_Glass2 }
}

// An excellent lead crystal glass!
#declare deprecated once "See notes in glass_old.inc regarding use of this deprecated texture: T_Glass3" T_Glass3 =
texture {
    pigment { color rgbf <0.98, 0.98, 0.98, 0.9> }
    finish { F_Glass3 }
}

#declare deprecated once "See notes in glass_old.inc regarding use of this deprecated texture: T_Glass4" T_Glass4 =
texture {
    pigment { color rgbf <0.98, 1.0, 0.99, 0.75> }
    finish { F_Glass4 }
}

#declare deprecated once "See notes in glass_old.inc regarding use of this deprecated texture: T_Old_Glass" T_Old_Glass =
texture {
    pigment { color rgbf <0.8, 0.9, 0.85, 0.85> }
    finish { F_Glass4 }
}

#declare deprecated once "See notes in glass_old.inc regarding use of this deprecated texture: T_Winebottle_Glass" T_Winebottle_Glass =
texture {
    pigment { color rgbf <0.4, 0.72, 0.4, 0.6> }
    finish { F_Glass4 }
}

#declare deprecated once "See notes in glass_old.inc regarding use of this deprecated texture: T_Beerbottle_Glass" T_Beerbottle_Glass =
texture {
    pigment { color rgbf <0.7, 0.5, 0.1, 0.6> }
    finish { F_Glass4 }
}

// A few color variations on Norm's glass
// Ruby glass
#declare deprecated once "See notes in glass_old.inc regarding use of this deprecated texture: T_Ruby_Glass" T_Ruby_Glass =
texture {
    pigment { color rgbf <0.9, 0.1, 0.2, 0.8> }
    finish { F_Glass4 }
}

#declare deprecated once "See notes in glass_old.inc regarding use of this deprecated texture: T_Green_Glass" T_Green_Glass =
texture {
    pigment { color rgbf <0.8, 1, 0.95, 0.9> }
    finish { F_Glass3 }
}

#declare deprecated once "See notes in glass_old.inc regarding use of this deprecated texture: T_Dark_Green_Glass" T_Dark_Green_Glass =
texture {
    pigment { color rgbf <0.1, 0.7, 0.8, 0.8> }
    finish { F_Glass4 }
}

#declare deprecated once "See notes in glass_old.inc regarding use of this deprecated texture: T_Yellow_Glass" T_Yellow_Glass =
texture {
    pigment { color rgbf <0.8, 0.8, 0.2, 0.8> }
    finish { F_Glass4 }
}

// Orange/Amber glass
#declare deprecated once "See notes in glass_old.inc regarding use of this deprecated texture: T_Orange_Glass" T_Orange_Glass =
texture {
    pigment { rgbf <1.0, 0.5, 0.0, 0.8> }
    finish { F_Glass4 }
}

// Vicks bottle glass
#declare deprecated once "See notes in glass_old.inc regarding use of this deprecated texture: T_Vicksbottle_Glass" T_Vicksbottle_Glass =
texture {
    pigment { color rgbf <0.1, 0.15, 0.5, 0.9> }
    finish { F_Glass4 }
}

#version Glass_Old_Inc_Temp;
#end
`,
    'golds.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

#ifndef(Gold_Inc_Temp)
#declare Gold_Inc_Temp=version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
#debug "including golds.inc\\n"
#end

/*
              Persistence of Vision Raytracer Version 3.1
                      Gold textures
*/

#declare GoldBase = <1.00, 0.875, 0.575>;  // mine again

// This set shifts the color toward orange by subtracting
// bluegreen from the base color.
#declare CVect1 = GoldBase  - <0.00, 0.20, 0.40>;
#declare CVect2 = GoldBase  - <0.00, 0.15, 0.30>;
#declare CVect3 = GoldBase  - <0.00, 0.10, 0.20>;
#declare CVect4 = GoldBase  - <0.00, 0.05, 0.1>;
#declare CVect5 = GoldBase  - <0.00, 0.00, 0.00>;

// Cast CVect as an rgb vector
#declare P_Gold1    = rgb CVect1;             // back row
#declare P_Gold2    = rgb CVect2;
#declare P_Gold3    = rgb CVect3;
#declare P_Gold4    = rgb CVect4;
#declare P_Gold5    = rgb CVect5;            // front row

// Reflection colors, derived from pigment color, "grayed down" a touch.
#declare R_GoldA =  P_Gold1 * 0.30 + <0.25,0.25,0.25>;        // left column (soft)
#declare R_GoldB =  P_Gold2 * 0.35 + <0.25,0.25,0.25>;
#declare R_GoldC =  P_Gold3 * 0.40 + <0.25,0.25,0.25>;
#declare R_GoldD =  P_Gold4 * 0.45 + <0.25,0.25,0.25>;
#declare R_GoldE =  P_Gold5 * 0.50 + <0.25,0.25,0.25>;       // right column (hard)


// Ambient colors, derived from base color
#declare A_GoldA    =  P_Gold1 * 0.12 + <0.1,0.1,0.1>;      // left column  (soft)
#declare A_GoldB    =  P_Gold2 * 0.10 + <0.1,0.1,0.1>;
#declare A_GoldC    =  P_Gold3 * 0.08 + <0.1,0.1,0.1>;
#declare A_GoldD    =  P_Gold4 * 0.05 + <0.1,0.1,0.1>;
#declare A_GoldE    =  P_Gold5 * 0.02 + <0.1,0.1,0.1>;     // right column (hard)

// Diffuse values
// Calculated as 1 - (ambient+reflective+specular values)
#declare D_GoldA    = 1-(((R_GoldA.red+R_GoldA.green+R_GoldA.blue)/3)
                       + ((A_GoldA.red+A_GoldA.green+A_GoldA.blue)/3));
#declare D_GoldB    = 1-(((R_GoldB.red+R_GoldB.green+R_GoldB.blue)/3)
                       + ((A_GoldB.red+A_GoldB.green+A_GoldB.blue)/3));
#declare D_GoldC    = 1-(((R_GoldC.red+R_GoldC.green+R_GoldC.blue)/3)
                       + ((A_GoldC.red+A_GoldC.green+A_GoldC.blue)/3));
#declare D_GoldD    = 1-(((R_GoldD.red+R_GoldD.green+R_GoldD.blue)/3)
                       + ((A_GoldD.red+A_GoldD.green+A_GoldD.blue)/3));
#declare D_GoldE    = 1-(((R_GoldE.red+R_GoldE.green+R_GoldE.blue)/3)
                       + ((A_GoldE.red+A_GoldE.green+A_GoldE.blue)/3));

#declare D_GoldA = max(D_GoldA, 0);
#declare D_GoldB = max(D_GoldB, 0);
#declare D_GoldC = max(D_GoldC, 0);
#declare D_GoldD = max(D_GoldD, 0);
#declare D_GoldE = max(D_GoldE, 0);


// #debug "\\nReflection colors:"
// #debug concat("\\nR_GoldA=<", str(R_GoldA.red,   5, 5), "," ,
//                              str(R_GoldA.green, 5, 5),"," ,
//                              str(R_GoldA.blue,  5, 5), ">")
// #debug concat("\\nR_GoldB=<", str(R_GoldB.red,   5, 5), "," ,
//                              str(R_GoldB.green, 5, 5),"," ,
//                              str(R_GoldB.blue,  5, 5), ">")
// #debug concat("\\nR_GoldC=<", str(R_GoldC.red,   5, 5), "," ,
//                              str(R_GoldC.green, 5, 5),"," ,
//                              str(R_GoldC.blue,  5, 5), ">")
// #debug concat("\\nR_GoldD=<", str(R_GoldD.red,   5, 5), "," ,
//                              str(R_GoldD.green, 5, 5),"," ,
//                              str(R_GoldD.blue,  5, 5), ">")
// #debug concat("\\nR_GoldE=<", str(R_GoldE.red,   5, 5), "," ,
//                              str(R_GoldE.green, 5, 5),"," ,
//                              str(R_GoldE.blue,  5, 5), ">")
//
// #debug "\\n\\nAmbient colors:"
// #debug concat("\\nA_GoldA=<", str(A_GoldA.red,   5, 5), "," ,
//                              str(A_GoldA.green, 5, 5),"," ,
//                              str(A_GoldA.blue,  5, 5), ">")
// #debug concat("\\nA_GoldB=<", str(A_GoldB.red,   5, 5), "," ,
//                              str(A_GoldB.green, 5, 5),"," ,
//                              str(A_GoldB.blue,  5, 5), ">")
// #debug concat("\\nA_GoldC=<", str(A_GoldC.red,   5, 5), "," ,
//                              str(A_GoldC.green, 5, 5),"," ,
//                              str(A_GoldC.blue,  5, 5), ">")
// #debug concat("\\nA_GoldD=<", str(A_GoldD.red,   5, 5), "," ,
//                              str(A_GoldD.green, 5, 5),"," ,
//                              str(A_GoldD.blue,  5, 5), ">")
// #debug concat("\\nA_GoldE=<", str(A_GoldE.red,   5, 5), "," ,
//                              str(A_GoldE.green, 5, 5),"," ,
//                              str(A_GoldE.blue,  5, 5), ">")
//
//
// #debug "\\n\\nDiffuse values:"
// #debug concat("\\nD_GoldA = ",str(D_GoldA, 5, 5))
// #debug concat("\\nD_GoldB = ",str(D_GoldB, 5, 5))
// #debug concat("\\nD_GoldC = ",str(D_GoldC, 5, 5))
// #debug concat("\\nD_GoldD = ",str(D_GoldD, 5, 5))
// #debug concat("\\nD_GoldE = ",str(D_GoldE, 5, 5))
// #debug "\\n"

#declare M = 1;    //   Metallic amount

//*****Finishes****
// Left column, dullest & darkest
#declare F_MetalA  =
finish {
    brilliance 2
    diffuse D_GoldA
    ambient A_GoldA
    reflection R_GoldA
    metallic M
    specular 0.20
    roughness 1/20
}

#declare F_MetalB  =
finish {
    brilliance 3
    diffuse D_GoldB
    ambient A_GoldB
    reflection R_GoldB
    metallic M
    specular 0.30
    roughness 1/60
}

#declare F_MetalC  =
finish {
    brilliance 4
    diffuse D_GoldC
    ambient A_GoldC
    reflection R_GoldC
    metallic M
    specular 0.60
    roughness 1/80
}

#declare F_MetalD  =
finish {
    brilliance 5
    diffuse D_GoldD
    ambient A_GoldD
    reflection R_GoldD
    metallic M
    specular 0.70
    roughness 1/100
}

#declare F_MetalE  =
finish {
    brilliance 6
    diffuse D_GoldE
    ambient A_GoldE
    reflection R_GoldE
    metallic M
    specular 0.80
    roughness 1/120
}

//                              GOLDS
#declare T_Gold_1A = texture { pigment { P_Gold1 } finish { F_MetalA } }
#declare T_Gold_1B = texture { pigment { P_Gold1 } finish { F_MetalB } }
#declare T_Gold_1C = texture { pigment { P_Gold1 } finish { F_MetalC } }
#declare T_Gold_1D = texture { pigment { P_Gold1 } finish { F_MetalD } }
#declare T_Gold_1E = texture { pigment { P_Gold1 } finish { F_MetalE } }

#declare T_Gold_2A = texture { pigment { P_Gold2 } finish { F_MetalA } }
#declare T_Gold_2B = texture { pigment { P_Gold2 } finish { F_MetalB } }
#declare T_Gold_2C = texture { pigment { P_Gold2 } finish { F_MetalC } }
#declare T_Gold_2D = texture { pigment { P_Gold2 } finish { F_MetalD } }
#declare T_Gold_2E = texture { pigment { P_Gold2 } finish { F_MetalE } }

#declare T_Gold_3A = texture { pigment { P_Gold3 } finish { F_MetalA } }
#declare T_Gold_3B = texture { pigment { P_Gold3 } finish { F_MetalB } }
#declare T_Gold_3C = texture { pigment { P_Gold3 } finish { F_MetalC } }
#declare T_Gold_3D = texture { pigment { P_Gold3 } finish { F_MetalD } }
#declare T_Gold_3E = texture { pigment { P_Gold3 } finish { F_MetalE } }

#declare T_Gold_4A = texture { pigment { P_Gold4 } finish { F_MetalA } }
#declare T_Gold_4B = texture { pigment { P_Gold4 } finish { F_MetalB } }
#declare T_Gold_4C = texture { pigment { P_Gold4 } finish { F_MetalC } }
#declare T_Gold_4D = texture { pigment { P_Gold4 } finish { F_MetalD } }
#declare T_Gold_4E = texture { pigment { P_Gold4 } finish { F_MetalE } }

#declare T_Gold_5A = texture { pigment { P_Gold5 } finish { F_MetalA } }
#declare T_Gold_5B = texture { pigment { P_Gold5 } finish { F_MetalB } }
#declare T_Gold_5C = texture { pigment { P_Gold5 } finish { F_MetalC } }
#declare T_Gold_5D = texture { pigment { P_Gold5 } finish { F_MetalD } }
#declare T_Gold_5E = texture { pigment { P_Gold5 } finish { F_MetalE } }

//The following #declares are needed for stage_xz.pov

#declare T01 = texture { T_Gold_1A }
#declare T02 = texture { T_Gold_1B }
#declare T03 = texture { T_Gold_1C }
#declare T04 = texture { T_Gold_1D }
#declare T05 = texture { T_Gold_1E }

#declare T06 = texture { T_Gold_2A }
#declare T07 = texture { T_Gold_2B }
#declare T08 = texture { T_Gold_2C }
#declare T09 = texture { T_Gold_2D }
#declare T10 = texture { T_Gold_2E }

#declare T11 = texture { T_Gold_3A }
#declare T12 = texture { T_Gold_3B }
#declare T13 = texture { T_Gold_3C }
#declare T14 = texture { T_Gold_3D }
#declare T15 = texture { T_Gold_3E }

#declare T16 = texture { T_Gold_4A }
#declare T17 = texture { T_Gold_4B }
#declare T18 = texture { T_Gold_4C }
#declare T19 = texture { T_Gold_4D }
#declare T20 = texture { T_Gold_4E }

#declare T21 = texture { T_Gold_5A }
#declare T22 = texture { T_Gold_5B }
#declare T23 = texture { T_Gold_5C }
#declare T24 = texture { T_Gold_5D }
#declare T25 = texture { T_Gold_5E }

#version Gold_Inc_Temp;
#end
`,
    'ior.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.8 Include File
//    File: ior.inc
//    Last updated: 2017-07-02
//    Description: This file contains constants for ior and dispersion of various materials.

#ifndef(Ior_Inc_Temp)
#declare Ior_Inc_Temp=version;
#version 3.8;

#ifdef(View_POV_Include_Stack)
#debug "including ior.inc\\n"
#end

// Index Of Refraction and Dispersion of various materials
// =======================================================

//  Original 2008-2015 by Christoph Lipka

//  Notes on literature:
//
//  * Refractive index is typically denoted with the symbol "n" (sometimes "N"), optionally followed by a subscript designating
//    the specific conditions under which measurements were made. Common subscripts are:
//    - Greek lower case letters omega and epsilon:
//      These are related to birefringence (i.e. the property of a material to refract light at two different angles, splitting up
//      the light according to polarization).
//      Since PoV-ray currently doesn't support bireferingence at all, we can ignore this effect and use an average of the values.
//    - Greek lower case letters alpha, beta and gamma:
//      These are related to biaxial birefringence, aka trirefringence. Again, no PoV-ray support.
//      Sometimes, Nx, Ny and Nz or simply alpha, beta and gamma are used for n[alpha], n[beta], n[gamma].
//    - Latin uppercase (sometimes lowercase) letters:
//      These are related to the wavelength of the light; the letter denotes the corresponding "Fraunhofer line", a series of
//      distinct spectral lines in natural sunlight, with the following being most common:
//        B   686.719nm   extreme red   molecular Oxygen (O2)
//        C   656.281nm   red           Hydrogen (H)
//        D   589.29 nm   yellow        Sodium (Na); center of D1 and D2 ("Sodium doublet")
//        F   486.134nm   blue          Hydrogen (H)
//        G   430.78 nm   violet        Iron (Fe, 430.790nm) or Calcium (Ca, 430.774 nm)
//        h   410.175nm   violet        Hydrogen (H); Balmer series delta; alternatively center of delta and epsilon (404.7 nm)
//      We're also using the following:
//        e   438.355nm   violet        Iron (Fe); note that designation "e" may also be used for the 546.073nm Mercury (Hg) line
//    - If no further designation is used, the refractive index is usually measured for Fraunhofer line "D".
//    The PoV-ray documentation does not specify which color (let alone wavelength) is considered "neutral" with respect to
//    dispersion, so I suggest using nD, if only for simplicity.
//
//  * Dispersion is typically characterized in one of the following ways:
//    - A (typically undesignated) value in order of magnitude ~0.010:
//      Such a value specifies the difference of the refractive indices for two given wavelengths. Usually, nG-nB is specified.
//      Differences between other wavelengths will be denoted accordingly as e.g. "nF-nC".
//      This is often seen with natural minerals.
//    - The so-called "Abbe number":
//      This value specifies the quotient (nD-1)/(nF-nC).
//      This is often seen with industrial mass products, especially glass and common glass substitutes.
//    - By refractive indices for individual wavelengths.
//      This is often seen with industrial high-end products.
//    PoV-ray characterizes dispersion as the quotient of refractive indices for "violet" and "red"; assuming that this roughly
//    matches nG and nB respectively, the value to be used can quite easily be approximated from nG-nB and the overall index of
//    refraction, as long as nG-nB is significantly small (which in practice it always is).
//    Approximating the PoV-ray "dispersion" value from the Abbe number is not so straightforward though, as this is based on a
//    different wavelength interval, and the index of refraction is not linear with respect to wavelength.
//    Approximating the PoV-ray "dispersion" value from individual wavelengths is again an easy task of course, provided that the
//    wavelengths of two of the known refractive indices qualify as "violet" and "red" respectively.
//
//  Other notes:
//
//  * Not all of the materials listed below are typically transparent. The refractive indices may nonetheless be of interest
//    in subsurface scattering simulation, or to properly simulate a polished gem's reflection using the fresnel keyword,
//    so I included them here as I happened to come across them.
//  * Some materials have varying optical properties or exhibit birefringence, making it impossible to specify a single exact
//    refractive index; in such cases, a typical average value was chosen.


// Macros to approximate POV-Ray's "dispersion" value
// --------------------------------------------------

#local Average = function(x,y) { (x+y)/2 }

// from refractive index n (nD) and nominal dispersion disp (nG-nB)
#macro IorData_n_disp (n, optional disp)
  #local iorResult = n;
  #ifdef(local.disp)
    #local dispResult = 1+disp/(n-disp/2);
  #end
  ( iorResult , local.dispResult )
#end

// from typical refractive index range n1 to n2 (nD) and typical nominal dispersion disp1 to disp2 (nG-nB)
#macro IorData_n_disp_Range (n1, optional n2, optional disp1, optional disp2)
  #ifdef(local.n2)
    #local n = Average(n1,n2);
  #else
    #local n = n1;
  #end
  #ifdef(local.disp1)
    #ifdef(local.disp2)
      #local disp = Average(disp1,disp2);
    #else
      #local disp = disp1;
    #end
  #end
  IorData_n_disp(n, local.disp)
#end

// from refractive indices at Fraunhofer lines G, D and B
#macro IorData_G_D_B (nG, nD, nB)
  IorData_n_disp(nD, nG-nB)
#end

// from refractive indices at three other wavelengths;
// for now we're happy with Fraunhofer lines e(Fe), h or 404.7nm instead of nG, and with Fraunhofer line C instead of B
#macro IorData_eFe_D_B   ( neFe , nD , nB ) IorData_G_D_B ( neFe , nD , nB ) #end
#macro IorData_G_D_C     ( nG   , nD , nC ) IorData_G_D_B ( nG   , nD , nC ) #end
#macro IorData_h_D_C     ( nh   , nD , nC ) IorData_G_D_B ( nh   , nD , nC ) #end
#macro IorData_405nm_D_C ( n405 , nD , nC ) IorData_G_D_B ( n405 , nD , nC ) #end


// Glasses
// -------

// Common Optical Glasses by Schott Designations

// Source: Schott Optical Glass Data Sheets, 04/15/2015, found at:
//         http://www.schott.com/advanced_optics/english/abbe_datasheets/schott-datasheet-all-english.pdf
#declare ( iorGlassBaK1     , dispGlassBaK1     ) = IorData_405nm_D_C ( 1.58941, 1.57241, 1.56949 );
#declare ( iorGlassBK7      , dispGlassBK7      ) = IorData_405nm_D_C ( 1.53024, 1.51673, 1.51432 );
#declare ( iorGlassF2       , dispGlassF2       ) = IorData_405nm_D_C ( 1.65064, 1.61989, 1.61503 );
#declare ( iorGlassLaSFN9   , dispGlassLaSFN9   ) = IorData_405nm_D_C ( 1.89845, 1.85002, 1.84255 );
#declare ( iorGlassSF11     , dispGlassSF11     ) = IorData_405nm_D_C ( 1.84235, 1.78446, 1.77596 );


// Multi-Purpose Glasses

// Source: http://refractiveindex.info
#declare ( iorQuartzGlass   , dispQuartzGlass   ) = IorData_G_D_B     ( 1.4671,  1.4584,  1.4556  ); // fused silica
#declare ( iorSodaLimeGlass , dispSodaLimeGlass ) = IorData_G_D_B     ( 1.5338,  1.5233,  1.5199  );

// Generic Glasses

#declare ( iorCrownGlass                  , optional dispCrownGlass         ) = ( iorGlassBK7      , dispGlassBK7      ); // most common crown glass
#declare ( iorFlintGlass                  , optional dispFlintGlass         ) = ( iorGlassSF11     , dispGlassSF11     ); // a common flint glass
#declare ( iorWindowGlass                 , optional dispWindowGlass        ) = ( iorSodaLimeGlass , dispSodaLimeGlass );
#declare ( iorGlass                       , optional dispGlass              ) = ( iorSodaLimeGlass , dispSodaLimeGlass );

// Glass Aliases

#declare ( deprecated iorCrownGlassBaK1   , deprecated dispCrownGlassBaK1   ) = ( iorGlassBaK1     , dispGlassBaK1     );
#declare ( deprecated iorCrownGlassBK7    , deprecated dispCrownGlassBK7    ) = ( iorGlassBK7      , dispGlassBK7      );
#declare ( deprecated iorFlintGlassF2     , deprecated dispFlintGlassF2     ) = ( iorGlassF2       , dispGlassF2       );
#declare ( deprecated iorFlintGlassLaSFN9 , deprecated dispFlintGlassLaSFN9 ) = ( iorGlassLaSFN9   , dispGlassLaSFN9   );
#declare ( deprecated iorFlintGlassSF11   , deprecated dispFlintGlassSF11   ) = ( iorGlassSF11     , dispGlassSF11     );


// Plastics and Organic Materials
// ------------------------------

// Generic Plastics and Organic Materials

// Source: http://refractiveindex.info
#declare ( iorCellulose   , dispCellulose   ) = IorData_eFe_D_B ( 1.4808 , 1.4701 , 1.4666 ); // NOT nitrocellulose or celluloid!
#declare ( iorPC          , dispPC          ) = IorData_eFe_D_B ( 1.6109 , 1.5846 , 1.5765 ); // polycarbonate
#declare ( iorPMMA        , dispPMMA        ) = IorData_G_D_B   ( 1.5018 , 1.4905 , 1.4872 ); // polymethylmethacrylate
#declare ( iorPS          , dispPS          ) = IorData_eFe_D_B ( 1.6165 , 1.5893 , 1.5837 ); // polystyrene
#declare ( iorPVP         , dispPVP         ) = IorData_G_D_B   ( 1.5449 , 1.5273 , 1.5233 ); // polyvinylpyrrolidone

// Source: http://www.matbase.com
#declare ( iorABS         ,                 ) = IorData_n_disp  (           1.6   ,        ); // acrylonitrile butadiene styrene

// Source: http://www.goodfellow.com
#declare ( iorPVC         ,                 ) = IorData_n_disp  (           1.54  ,        ); // polyvinylchloride

// Commercial Plastics

// Source: http://refractiveindex.info
#declare ( iorNAS21       , dispNAS21       ) = IorData_eFe_D_B ( 1.5929 , 1.5711 , 1.5644 ); // a styrene methyl methacrylate
#declare ( iorOptorez1330 , dispOptorez1330 ) = IorData_eFe_D_B ( 1.5216 , 1.5094 , 1.5055 );
#declare ( iorZeonexE48R  , dispZeonexE48R  ) = IorData_eFe_D_B ( 1.5431 , 1.5304 , 1.5264 );

// Plastics Aliases

#declare ( iorAcrylonitrileButadieneStyrene , optional dispAcrylonitrileButadieneStyrene ) = ( iorABS  , dispABS  );
#declare ( iorPolycarbonate                 , optional dispPolycarbonate                 ) = ( iorPC   , dispPC   );
#declare ( iorPolymethylmethacrylate        , optional dispPolymethylmethacrylate        ) = ( iorPMMA , dispPMMA );
#declare ( iorPolystyrene                   , optional dispPolystyrene                   ) = ( iorPS   , dispPS   );
#declare ( iorPolyvinylchloride             , optional dispPolyvinylchloride             ) = ( iorPVC  , dispPVC  );
#declare ( iorPolyvinylpyrrolidone          , optional dispPolyvinylpyrrolidone          ) = ( iorPVP  , dispPVP  );

// Plastics Trademarks

#declare ( iorAcrylicGlass                  , optional dispAcrylicGlass                  ) = ( iorPMMA , dispPMMA );
#declare ( iorPlexiglas                     , optional dispPlexiglas                     ) = ( iorPMMA , dispPMMA );
#declare ( iorAcrylite                      , optional dispAcrylite                      ) = ( iorPMMA , dispPMMA );
#declare ( iorLucite                        , optional dispLucite                        ) = ( iorPMMA , dispPMMA );
#declare ( iorPerspex                       , optional dispPerspex                       ) = ( iorPMMA , dispPMMA );


// Gemstones and Minerals
// ----------------------

// Source: http://gemologyproject.com
#declare ( iorAchroite           , dispAchroite           ) = IorData_n_disp_Range ( 1.62 ,1.64  , .017,     );
#declare ( iorAmber              ,                        ) = IorData_n_disp       ( 1.54        ,           );
#declare ( iorAmmolite           ,                        ) = IorData_n_disp_Range ( 1.525,1.670 ,     ,     );
#declare ( iorAnatase            , dispAnatase            ) = IorData_n_disp_Range ( 2.488,2.561 , .213,     );
#declare ( iorAndalusite         , dispAndalusite         ) = IorData_n_disp_Range ( 1.63 ,1.64  , .016,     );
#declare ( iorAndesine           ,                        ) = IorData_n_disp_Range ( 1.551,1.60  ,     ,     );
#declare ( iorAndraditeGarnet    , dispAndraditeGarnet    ) = IorData_n_disp_Range ( 1.85 ,1.89  , .057,     );
#declare ( iorApatite            , dispApatite            ) = IorData_n_disp_Range ( 1.63 ,1.64  , .013,     );
#declare ( iorAxinite            , dispAxinite            ) = IorData_n_disp_Range ( 1.674,1.706 , .018,.020 );
#declare ( iorAzurite            ,                        ) = IorData_n_disp_Range ( 1.720,1.848 ,     ,     );
#declare ( iorBarite             ,                        ) = IorData_n_disp_Range ( 1.634,1.648 ,     ,     );
#declare ( iorBenitoite          , dispBenitoite          ) = IorData_n_disp_Range ( 1.75 ,1.80  , .046,     );
#declare ( iorBeryl              , dispBeryl              ) = IorData_n_disp_Range ( 1.577,1.583 , .014,     );
#declare ( iorDiopside           , dispDiopside           ) = IorData_n_disp_Range ( 1.67 ,1.70  , .013,     );
#declare ( iorChrysoberyl        , dispChrysoberyl        ) = IorData_n_disp_Range ( 1.74 ,1.75  , .015,     );
#declare ( iorClinohumite        ,                        ) = IorData_n_disp_Range ( 1.628,1.674 ,     ,     );
#declare ( iorCopal              ,                        ) = IorData_n_disp       ( 1.54        ,           );
#declare ( iorCoral              ,                        ) = IorData_n_disp_Range ( 1.48 ,1.56  ,     ,     );
#declare ( iorCorundum           , dispCorundum           ) = IorData_n_disp_Range ( 1.762,1.770 , .018,     );
#declare ( iorCubicZirconia      , dispCubicZirconia      ) = IorData_n_disp_Range ( 2.171,2.177 , .059,.065 ); // [1]; NOT Zircon!
#declare ( iorDanburite          , dispDanburite          ) = IorData_n_disp_Range ( 1.630,1.636 , .017,     );
#declare ( iorDatolite           , dispDatolite           ) = IorData_n_disp_Range ( 1.622,1.670 , .016,     );
#declare ( iorDiamond            , dispDiamond            ) = IorData_n_disp       ( 2.417       , .044      );
#declare ( iorDiaspore           ,                        ) = IorData_n_disp_Range ( 1.682,1.752 ,     ,     );
#declare ( iorDioptase           , dispDioptase           ) = IorData_n_disp_Range ( 1.644,1.709 , .030,     );
#declare ( iorEkanite            ,                        ) = IorData_n_disp_Range ( 1.560,1.596 ,     ,     );
#declare ( iorEnstatite          , dispEnstatite          ) = IorData_n_disp_Range ( 1.65 ,1.68  , .010,     );
#declare ( iorFluorite           , dispFluorite           ) = IorData_n_disp       ( 1.434       , .007      );
#declare ( iorFosterite          ,                        ) = IorData_n_disp_Range ( 1.634,1.670 ,     ,     );
#declare ( iorGrossulariteGarnet , dispGrossulariteGarnet ) = IorData_n_disp_Range ( 1.738,1.745 , .027,     );
#declare ( iorIolite             , dispIolite             ) = IorData_n_disp_Range ( 1.53 ,1.55  , .017,     );
#declare ( iorJasper             ,                        ) = IorData_n_disp_Range ( 1.53 ,1.54  ,     ,     );
#declare ( iorKornerupine        , dispKornerupine        ) = IorData_n_disp_Range ( 1.67 ,1.68  , .019,     );
#declare ( iorKyanite            , dispKyanite            ) = IorData_n_disp_Range ( 1.710,1.734 , .020,     );
#declare ( iorLabradorite        ,                        ) = IorData_n_disp_Range ( 1.559,1.570 ,     ,     );
#declare ( iorLapisLazuli        ,                        ) = IorData_n_disp_Range ( 1.500,1.670 ,     ,     ); // lazurite compound
#declare ( iorMalachite          ,                        ) = IorData_n_disp_Range ( 1.655,1.909 ,     ,     );
#declare ( iorMawSitSit          ,                        ) = IorData_n_disp       ( 1.52        ,           ); // common value; nD may range up to 1.74
#declare ( iorMoissanite         , dispMoissanite         ) = IorData_n_disp_Range ( 2.648,2.691 , .104,     );
#declare ( iorMoonstone          ,                        ) = IorData_n_disp       ( 1.52        ,           );
#declare ( iorNephriteJade       ,                        ) = IorData_n_disp       ( 1.62        ,           ); // "soft jade"
#declare ( iorOpal               ,                        ) = IorData_n_disp       ( 1.45        ,           );
#declare ( iorOrthoclase         , dispOrthoclase         ) = IorData_n_disp_Range ( 1.52 ,1.53  , .012,     );
#declare ( iorPearl              ,                        ) = IorData_n_disp_Range ( 1.52 ,1.69  ,     ,     );
#declare ( iorPectolite          ,                        ) = IorData_n_disp_Range ( 1.59 ,1.63  ,     ,     );
#declare ( iorPeridot            , dispPeridot            ) = IorData_n_disp_Range ( 1.65 ,1.69  , .020,     );
#declare ( iorPrehnite           ,                        ) = IorData_n_disp_Range ( 1.616,1.649 ,     ,     );
#declare ( iorPyropeGarnet       , dispPyropeGarnet       ) = IorData_n_disp_Range ( 1.730,1.760 , .022,     );
#declare ( iorQuartz             , dispQuartz             ) = IorData_n_disp_Range ( 1.544,1.553 , .013,     );
#declare ( iorSiderite           ,                        ) = IorData_n_disp_Range ( 1.633,1.875 ,     ,     );
#declare ( iorSphene             , dispSphene             ) = IorData_n_disp_Range ( 1.880,2.099 , .051,     );
#declare ( iorSpinel             , dispSpinel             ) = IorData_n_disp_Range ( 1.712,1.736 , .026,     ); // [1]
#declare ( iorSpodumene          , dispSpodumene          ) = IorData_n_disp_Range ( 1.66 ,1.68  , .017,     );
#declare ( iorTopaz              , dispTopaz              ) = IorData_n_disp_Range ( 1.606,1.644 , .014,     );
#declare ( iorTourmaline         , dispTourmaline         ) = IorData_n_disp_Range ( 1.62, 1.64  , .018,     );
#declare ( iorTurquoise          ,                        ) = IorData_n_disp_Range ( 1.610,1.650 ,     ,     );
#declare ( iorVesuvianite        , dispVesuvianite        ) = IorData_n_disp_Range ( 1.700,1.725 , .019,     );
#declare ( iorZircon             , dispZircon             ) = IorData_n_disp_Range ( 1.78, 1.99  , .039,     ); // NOT [Cubic] Zirconia!
#declare ( iorZoisite            , dispZoisite            ) = IorData_n_disp_Range ( 1.685,1.707 , .012,     ); // [2]

// Source: Wikipedia
#declare ( iorAlmandineGarnet    , dispAlmandineGarnet    ) = IorData_n_disp       ( 1.79        , .024      );
#declare ( iorJadeite            ,                        ) = IorData_n_disp_Range ( 1.654,1.693 ,     ,     ); // "hard jade"
#declare ( iorRhodoliteGarnet    , dispRhodoliteGarnet    ) = IorData_n_disp       ( 1.76        , .026      );
#declare ( iorTsavoriteGarnet    , dispTsavoriteGarnet    ) = IorData_n_disp       ( 1.740       , .028      );

// Source:  Arthur Thomas, Gemstones: Properties, Identification and Use
#declare ( iorBoracite           ,                        ) = IorData_n_disp_Range ( 1.658,1.673 ,     ,     );
#declare ( iorCinnabar           ,                        ) = IorData_n_disp_Range ( 2.91 ,3.27  ,     ,     );
#declare ( iorCuprite            ,                        ) = IorData_n_disp       ( 2.85        ,           );
#declare ( iorDumortierite       ,                        ) = IorData_n_disp_Range ( 1.678,1.689 ,     ,     ); // NOT the gem of same name, which is quartz with dumortierite inclusions
#declare ( iorEudialyte          ,                        ) = IorData_n_disp_Range ( 1.598,1.613 ,     ,     );
#declare ( iorFibrolite          , dispFibrolite          ) = IorData_n_disp_Range ( 1.658,1.678 , .015,     );
#declare ( iorGaspeite           ,                        ) = IorData_n_disp_Range ( 1.160,1.830 ,     ,     );
#declare ( iorGrandiderite       ,                        ) = IorData_n_disp_Range ( 1.602,1.639 ,     ,     );
#declare ( iorHambergite         , dispHambergite         ) = IorData_n_disp_Range ( 1.55 ,1.63  , .015,     );
#declare ( iorHematite           ,                        ) = IorData_n_disp_Range ( 2.94 ,3.22  ,     ,     );
#declare ( iorKutnohorite        ,                        ) = IorData_n_disp_Range ( 1.535,1.727 ,     ,     );
#declare ( iorLawsonite          ,                        ) = IorData_n_disp_Range ( 1.665,1.686 ,     ,     );
#declare ( iorPainite            ,                        ) = IorData_n_disp_Range ( 1.787,1.816 ,     ,     );
#declare ( iorPezzottaite        ,                        ) = IorData_n_disp_Range ( 1.601,1.620 ,     ,     );
#declare ( iorPhenakite          , dispPhenakite          ) = IorData_n_disp_Range ( 1.654,1.670 , .015,     );
#declare ( iorPrehnite           ,                        ) = IorData_n_disp_Range ( 1.616,1.649 ,     ,     );
#declare ( iorProustite          ,                        ) = IorData_n_disp_Range ( 2.790,3.088 ,     ,     );
#declare ( iorPyragyrite         ,                        ) = IorData_n_disp_Range ( 2.881,3.084 ,     ,     );
#declare ( iorRhodozite          ,                        ) = IorData_n_disp       ( 1.69        ,           );
#declare ( iorSimpsonite         ,                        ) = IorData_n_disp_Range ( 2.025,2.045 ,     ,     );
#declare ( iorSinhalite          , dispSinhalite          ) = IorData_n_disp_Range ( 1.667,1.705 , .017,     );
#declare ( iorSmithsonite        ,                        ) = IorData_n_disp_Range ( 1.625,1.850 ,     ,     );
#declare ( iorSphalerite         , dispSphalerite         ) = IorData_n_disp_Range ( 2.37 ,2.42  , .156,     );
#declare ( iorStichtite          ,                        ) = IorData_n_disp_Range ( 1.516,1.545 ,     ,     );
#declare ( iorWillemite          ,                        ) = IorData_n_disp_Range ( 1.691,1.725 ,     ,     );

// Values from other sources:
// [1] disp = 0.020
// [2] disp = 0.030

// Source: ?
#declare ( iorSpessartiteGarnet  , dispSpessartiteGarnet  ) = IorData_n_disp       ( 1.81        , .027      );
#declare ( iorIvory              ,                        ) = IorData_n_disp       ( 1.540       ,           );

// Gemstone and Mineral Variants

#declare ( iorAgate              , optional dispAgate              ) = ( iorQuartz             , dispQuartz             );
#declare ( iorAlexandrite        , optional dispAlexandrite        ) = ( iorChrysoberyl        , dispChrysoberyl        );
#declare ( iorAmethyst           , optional dispAmethyst           ) = ( iorQuartz             , dispQuartz             );
#declare ( iorAmetrine           , optional dispAmetrine           ) = ( iorQuartz             , dispQuartz             );
#declare ( iorAquamarine         , optional dispAquamarine         ) = ( iorBeryl              , dispBeryl              );
#declare ( iorAventurine         , optional dispAventurine         ) = ( iorQuartz             , dispQuartz             );
#declare ( iorBixbite            , optional dispBixbite            ) = ( iorBeryl              , dispBeryl              );
#declare ( iorCalifornite        , optional dispCalifornite        ) = ( iorVesuvianite        , dispVesuvianite        );
#declare ( iorChalcedony         , optional dispChalcedony         ) = ( iorQuartz             , dispQuartz             );
#declare ( iorChromeDiopside     , optional dispChromeDiopside     ) = ( iorDiopside           , dispDiopside           );
#declare ( iorCitrine            , optional dispCitrine            ) = ( iorQuartz             , dispQuartz             );
#declare ( iorCyprine            , optional dispCyprine            ) = ( iorVesuvianite        , dispVesuvianite        );
#declare ( iorDemantoidGarnet    , optional dispDemantoidGarnet    ) = ( iorAndraditeGarnet    , dispAndraditeGarnet    );
#declare ( iorEmerald            , optional dispEmerald            ) = ( iorBeryl              , dispBeryl              );
#declare ( iorGoshenite          , optional dispGoshenite          ) = ( iorBeryl              , dispBeryl              );
#declare ( iorGreenovite         , optional dispGreenovite         ) = ( iorSphene             , dispSphene             );
#declare ( iorHeliodor           , optional dispHeliodor           ) = ( iorBeryl              , dispBeryl              );
#declare ( iorHiddenite          , optional dispHiddenite          ) = ( iorSpodumene          , dispSpodumene          );
#declare ( iorKunzite            , optional dispKunzite            ) = ( iorSpodumene          , dispSpodumene          );
#declare ( iorLarimar            , optional dispLarimar            ) = ( iorPectolite          , dispPectolite          );
#declare ( iorMaxixe             , optional dispMaxixe             ) = ( iorBeryl              , dispBeryl              );
#declare ( iorMorganite          , optional dispMorganite          ) = ( iorBeryl              , dispBeryl              );
#declare ( iorOnyx               , optional dispOnyx               ) = ( iorQuartz             , dispQuartz             );
#declare ( iorPadparadscha       , optional dispPadparadscha       ) = ( iorCorundum           , dispCorundum           );
#declare ( iorRoseQuartz         , optional dispRoseQuartz         ) = ( iorQuartz             , dispQuartz             );
#declare ( iorRuby               , optional dispRuby               ) = ( iorCorundum           , dispCorundum           );
#declare ( iorSapphire           , optional dispSapphire           ) = ( iorCorundum           , dispCorundum           );
#declare ( iorSmokyQuartz        , optional dispSmokyQuartz        ) = ( iorQuartz             , dispQuartz             );
#declare ( iorTanzanite          , optional dispTanzanite          ) = ( iorZoisite            , dispZoisite            );
#declare ( iorTigersEye          , optional dispTigersEye          ) = ( iorQuartz             , dispQuartz             );
#declare ( iorViolane            , optional dispViolane            ) = ( iorDiopside           , dispDiopside           );

// Gemstone and Mineral Aliases

#declare ( iorAdulariaMoonstone  , optional dispAdulariaMoonstone  ) = ( iorMoonstone          , dispMoonstone          );
#declare ( iorAmazonite          , optional dispAmazonite          ) = ( iorOrthoclase         , dispOrthoclase         );
#declare ( iorAmbosselite        , optional dispAmbosselite        ) = ( iorVesuvianite        , dispVesuvianite        );
#declare ( iorCarborundum        , optional dispCarborundum        ) = ( iorMoissanite         , dispMoissanite         );
#declare ( iorCordierite         , optional dispCordierite         ) = ( iorIolite             , dispIolite             );
#declare ( iorChalybite          , optional dispChalybite          ) = ( iorSiderite           , dispSiderite           );
#declare ( iorChromeSphene       , optional dispChromeSphene       ) = ( iorSphene             , dispSphene             );
#declare ( iorCyanite            , optional dispCyanite            ) = ( iorKyanite            , dispKyanite            );
#declare ( iorCZ                 , optional dispCZ                 ) = ( iorCubicZirconia      , dispCubicZirconia      );
#declare ( iorDisthene           , optional dispDisthene           ) = ( iorKyanite            , dispKyanite            );
#declare ( iorFireOpal           , optional dispFireOpal           ) = ( iorOpal               , dispOpal               );
#declare ( iorFluorspar          , optional dispFluorspar          ) = ( iorFluorite           , dispFluorite           );
#declare ( iorGarnetAlmandine    , optional dispGarnetAlmandine    ) = ( iorAlmandineGarnet    , dispAlmandineGarnet    );
#declare ( iorGarnetAndradite    , optional dispGarnetAndradite    ) = ( iorAndraditeGarnet    , dispAndraditeGarnet    );
#declare ( iorGarnetDemantoid    , optional dispGarnetDemantoid    ) = ( iorDemantoidGarnet    , dispDemantoidGarnet    );
#declare ( iorGarnetGrossularite , optional dispGarnetGrossularite ) = ( iorGrossulariteGarnet , dispGrossulariteGarnet );
#declare ( iorGarnetPyrope       , optional dispGarnetPyrope       ) = ( iorPyropeGarnet       , dispPyropeGarnet       );
#declare ( iorGarnetRhodolite    , optional dispGarnetRhodolite    ) = ( iorRhodoliteGarnet    , dispRhodoliteGarnet    );
#declare ( iorGarnetSpessartite  , optional dispGarnetSpessartite  ) = ( iorSpessartiteGarnet  , dispSpessartiteGarnet  );
#declare ( iorGarnetTsavorite    , optional dispGarnetTsavorite    ) = ( iorTsavoriteGarnet    , dispTsavoriteGarnet    );
#declare ( iorIdocrase           , optional dispIdocrase           ) = ( iorVesuvianite        , dispVesuvianite        );
#declare ( iorJadeNephrite       , optional dispJadeNephrite       ) = ( iorNephriteJade       , dispNephriteJade       );
#declare ( iorKFeldspar          , optional dispKFeldspar          ) = ( iorOrthoclase         , dispOrthoclase         );
#declare ( iorMoonstoneAdularia  , optional dispMoonstoneAdularia  ) = ( iorMoonstone          , dispMoonstone          );
#declare ( iorMossOpal           , optional dispMossOpal           ) = ( iorOpal               , dispOpal               );
#declare ( iorMunkrudite         , optional dispMunkrudite         ) = ( iorKyanite            , dispKyanite            );
#declare ( iorTitanite           , optional dispTitanite           ) = ( iorSphene             , dispSphene             );
#declare ( iorZirconia           , optional dispZirconia           ) = ( iorCubicZirconia      , dispCubicZirconia      ); // NOT Zircon!
#declare ( iorZultanite          , optional dispZultanite          ) = ( iorDiaspore           , dispDiaspore           );


// Cleanup
// -------

#undef IorData_n_disp
#undef IorData_n_disp_Range
#undef IorData_G_D_B
#undef IorData_eFe_D_B
#undef IorData_G_D_C
#undef IorData_h_D_C
#undef IorData_405nm_D_C

// end of ior.inc
#version Ior_Inc_Temp;
#end
`,
    'logo.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//	Persistence of Vision Raytracer Version 3.5 Scene Description File

#ifndef(Logo_Inc_Temp)
#declare Logo_Inc_Temp=version;
#version 3.5;

/*
The official POV-Ray Logo
Designed by Chris Colefax

This logo was the one that won the POV-Ray Logo Contest
held and organized by Rune S. Johansen in year 2000 and
monitored by the POV-Team.

Comment from Chris Colefax:

"This logo (or symbol, rather) attempts to encapsulate a
number of ideas. Firstly, the symbol represents an eye with
a ray being traced from it, capturing the fundamentally
visual nature of POV-Ray and the rendering process POV-Ray
uses.  More obviously,  it's a P, and both an O and a V can
be seen in it as well, making the symbol specific to (and
immediately identifiable with) POV-Ray, rather than
raytracing in general.  The basic symbol itself is a simple
CSG construction composed of five POV-Ray primitives.  The
simplicity of the symbol means that it can be presented
recognisably in a range of ways, from a graphical 2D logo
to a full blown rendering, or incorporated discreetly into
other designs and images."


Prism version and bevel version by Rune S. Johansen.

*/

#include "shapes.inc"

// The original version is made of various objects.
#declare Povray_Logo =
merge {
   sphere {2*y, 1}
   difference {
      cone {2*y, 1, -4*y, 0}
      sphere {2*y, 1.4 scale <1,1,2>}
   }
   difference {
      sphere {0, 1 scale <2.6, 2.2, 1>}
      sphere {0, 1 scale <2.3, 1.8, 2> translate <-0.35, 0, 0>}
      rotate z*30 translate 2*y
   }
   rotate <0, 0, -25>
   translate <-0.5,-0.35,0>
   scale 1/4
}

// The prism version is not really made of a prism object alone,
// but it looks that way.
#declare Povray_Logo_Prism =
merge {
   cylinder {-z, z, 1 translate 2*y}
   difference {
      prism {-0.9999, 0.9999, 4, <-1,2>, <1,2>, <0,-4>, <-1,2> rotate -90*x}
      cylinder {-z, z, 1.4 scale <1,0.9,1.1> translate 1.9*y}
   }
   difference {
      cylinder {-z, z, 1 scale <2.6, 2.2, 1>}
      cylinder {-z, z, 1 scale <2.22, 1.72, 1.1> translate <-0.43, 0, 0>}
      rotate z*30 translate 2*y
   }
   rotate <0, 0, -25>
   translate <-0.5,-0.35,0>
   scale <1/4,1/4,1/8>
}

// The bevel version has its base at the xy plane and
// is beveled in 45 degrees in the -z direction.
// Intersect the object with a plane to get a flat object
// with beveled edges.
#declare Povray_Logo_Bevel =
merge {
   cone {0, 1, z, 0 translate 2*y}
   difference {
      box {<-0.8,-4,0>, <0.8,0.9,0.7>}
      object{Supercone(-0.0001*z, 1.4,1.26, 1.0001*z, 2.4,2.26) translate 1.9*y}
      plane {vrotate( x-z, degrees(atan2(1/6,1))*z), 0 translate -4*y}
      plane {vrotate(-x-z,-degrees(atan2(1/6,1))*z), 0 translate -4*y}
   }
   difference {
      object{Supercone(0, 2.6,2.2, z, 1.6,1.2)}
      object{Supercone(-0.0001*z, 2.22,1.72, 1.0001*z, 3.22,2.72) translate -0.43*x}
      clipped_by {
         difference {
            cylinder { 0.0*z, 0.5*z, 1 scale <2.60,2.20,1.0>}
            cylinder {-0.1*z, 0.6*z, 1 scale <2.22,1.72,1.1> translate -0.43*x}
         }
      }
      rotate z*30 translate 2*y
   }
   rotate <0, 0, -25>
   translate <-0.5,-0.35,0>
   scale <1,1,-1>/4
}

#version Logo_Inc_Temp;
#end
`,
    'makegrass.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

// Persistence of Vision Ray Tracer version 3.6 / 3.7 Include File
// File: makegrass.inc
// --------------------------------------
// Author: Gilles Tran, 1999-2004, http://www.oyonale.com
// former mgrass.pov by Gilles Tran 
// Updated for POV-Ray 3.7: March-2013 
//
// Description: macros for creating grass.
// ================================================
// This file presents 3 macros
// MakeBlade() creates an individual blade of grass
// MakeGrassPatch() creates a patch of grass (mesh)
//     optional with saving the mesh in a text file
// MakePrairie() creates a prairie of grass patches
// ------------------------------------------------

#ifndef( makegrass_Inc_Temp)
#declare makegrass_Inc_Temp=version;
#version 3.6;

#ifdef(View_POV_Include_Stack)
   #debug "including makegrass.inc\\n"
#end

//==============================================
// MakeBlade macro
//==============================================
// The MakeBlade macro creates a grass blade with a central fold
// The blade is positionned at posBlade and rotated around the y axis according to segBlade
// Its length is lBlade.
// The blade bends from vector startBend to vector endBend
// The  describes how the curbe bends; low power bend faster
// --------------------------------------
// It first creates an array of points (vertices)
// Then it calculates the normals (optional)
/*
#declare doSmooth = true;       // smooth triangles                           
#declare posBlade = <0,0,0>;    // position of blade
#declare rotBlade = 100;        // rotation of blade around y
#declare segBlade= 20;          // number of blade segments - try low values (5 for instance) for tests
#declare lBlade = 10;           // length of blade
#declare xBladeStart = 1;       // width of blade at start
#declare xBladeEnd = 0.1;       // width of blade at the end
#declare zBladeStart = 0.5;     // depth of blade fold at start
#declare startBend = <0,1,0>;   // bending of blade at start (<0,1,0>=no bending)
#declare vBend = <0,0,1>;      // force bending the blade (<0,1,1> = 45�)
#declare pwBend = 1;           // bending power (how slowly the curve bends)
#declare dofold = false;        // true creates a fold in the blade (twice more triangles)
#declare dofile = false;        // true creates a mesh file
// --------------------------------------
*/

//---------------------------------------------------------------------------------------------------------------
#macro MakeBlade( doSmooth,      //  0 or 1,// smooth triangles
                  posBlade,      // <0,0,0>,// position of blade 
                  rotBlade,      //      00,// rotation of blade around y
                  segBlade,      //      20,// number of blade segments, try low values (5 for instance) for tests
                  lBlade,        //      10,// length of blade
                  xBladeStart,   //       1,// width of blade at start
                  xBladeEnd,     //     0.1,// width of blade at the end
                  zBladeStart,   //     0.5,// depth of blade fold at start
                  startBend,    //<0,1,0.3>,// bending of blade at start (<0,1,0>=no bending)
                  vBend,         // <0,0,1>,// force bending the blade (<0,1,1> = 45�)
                  pwBend,        //       1,// bending power (how slowly the curve bends)
                  dofold,        //  0 or 1,// true or 1 creates a fold in the blade (twice more triangles)
                  dofile         //  0 or 1,// true or 1 creates a mesh file
                ) //--------------------------------------------------------------------------------------------
#local lsegBlade=lBlade/segBlade;
#if (dofold=true)
        #local nI=3;
#else
        #local nI=2;
#end                
#local nJ=segBlade+1;
#local nP=nI*nJ;
#local P=array[nP]
#local N=array[nP]  
#local pBlade=<0,0,0>;              
#local Count=0;                                       
#local xBlade=xBladeStart;
#local zBlade=zBladeStart;
#if (dofold=true)
        #local P[0]=vaxis_rotate(-x*xBlade,y,rotBlade)+posBlade;
        #local P[1]=vaxis_rotate(z*zBlade,y,rotBlade)+posBlade;
        #local P[2]=vaxis_rotate(x*xBlade,y,rotBlade)+posBlade;
#else
        #local P[0]=vaxis_rotate(-x*xBlade,y,rotBlade)+posBlade;
        #local P[1]=vaxis_rotate(x*xBlade,y,rotBlade)+posBlade;

#end
#local Count=1; 
#local pBlade=vnormalize(startBend)*lsegBlade;
// --------------------------------------
// Fills the array of points
// --------------------------------------
#while (Count<nJ)          
        #local tBlade=Count/segBlade;
        // This is where the blade shape is defined
        #local pBlade=pBlade+lsegBlade*vnormalize(vnormalize(pBlade)+ vBend*pow(tBlade,pwBend));
        #local xBlade=xBladeStart+tBlade*(xBladeEnd-xBladeStart);
        #if (dofold=true)
                #local zBlade=zBladeStart*(1-tBlade);
                #local P[Count*nI]=vaxis_rotate(pBlade-x*xBlade,y,rotBlade)+posBlade;
                #local P[Count*nI+1]=vaxis_rotate(pBlade+z*zBlade,y,rotBlade)+posBlade;
                #local P[Count*nI+2]=vaxis_rotate(pBlade+x*xBlade,y,rotBlade)+posBlade;
        #else
                #local P[Count*nI]=vaxis_rotate(pBlade-x*xBlade,y,rotBlade)+posBlade;
                #local P[Count*nI+1]=vaxis_rotate(pBlade+x*xBlade,y,rotBlade)+posBlade;
        #end
        #local Count=Count+1;        
#end
// --------------------------------------
// Calculates normals if doSmooth = true
// --------------------------------------
#if (doSmooth=true)
#local N = array[nP] // Normales
#local q=0;
#while (q<nP)
#local i=mod(q,nI);#local j=(q-i)/nI;
#local V0 = q-nI-1;#if (i=0) #local V0=-1; #end
#local V1 = q-nI;
#local V2 = q-nI+1;#if (i=nI-1) #local V2=-1; #end
#local V3 = q-1;#if (i=0) #local V3=-1; #end
#local V4 = q;
#local V5 = q+1;#if (i=nI-1) #local V5=-1; #end
#local V6 = q+nI-1;#if (i=0) #local V6=-1; #end
#local V7 = q+nI;
#local V8 = q+nI+1;#if (i=nI-1) #local V8=-1; #end

#if (j=0) #local V0=-1;#local V1=-1;#local V2=-1;#end
#if (j=nJ-1) #local V6=-1;#local V7=-1;#local V8=-1; #end

#local N[q]=<0,0,0>;
#local k=0;
#if (V5>-1 & V8>-1) #local N[q]=N[q]+vcross(P[V4]-P[V5],P[V8]-P[V4]);#local k=k+1;#end
#if (V2>-1 & V5>-1) #local N[q]=N[q]+vcross(P[V4]-P[V2],P[V5]-P[V4]);#local k=k+1;#end
#if (V1>-1 & V2>-1) #local N[q]=N[q]+vcross(P[V4]-P[V1],P[V2]-P[V4]);#local k=k+1;#end
#if (V0>-1 & V1>-1) #local N[q]=N[q]+vcross(P[V4]-P[V0],P[V1]-P[V4]);#local k=k+1;#end
#if (V3>-1 & V0>-1) #local N[q]=N[q]+vcross(P[V4]-P[V3],P[V0]-P[V4]);#local k=k+1;#end
#if (V6>-1 & V3>-1) #local N[q]=N[q]+vcross(P[V4]-P[V6],P[V3]-P[V4]);#local k=k+1;#end
#if (V7>-1 & V6>-1) #local N[q]=N[q]+vcross(P[V4]-P[V7],P[V6]-P[V4]);#local k=k+1;#end
#if (V8>-1 & V7>-1) #local N[q]=N[q]+vcross(P[V4]-P[V8],P[V7]-P[V4]);#local k=k+1;#end
#local N[q]=N[q]/k;
#local q=q+1;#end
#end
// --------------------------------------
// Writes the triangles
// --------------------------------------

#local q=0;
#while (q<(nI*(nJ-1)-1))
#local i=mod(q,nI);#local j=(q-i)/nI;
#if (i <nI-1)
    #if (doSmooth=true)
        #if (dofile=true)
            #write(filehandle,"smooth_triangle{<",P[q].x,",",P[q].y,",",P[q].z,">,<",N[q].x,",",N[q].y,",",N[q].z,">,<",P[q+1].x,",",P[q+1].y,",",P[q+1].z,">,<",N[q+1].x,",",N[q+1].y,",",N[q+1].z,">,<",P[q+nI+1].x,",",P[q+nI+1].y,",",P[q+nI+1].z,">,<",N[q+nI+1].x,",",N[q+nI+1].y,",",N[q+nI+1].z,">}\\n")
            #write(filehandle,"smooth_triangle{<",P[q].x,",",P[q].y,",",P[q].z,">,<",N[q].x,",",N[q].y,",",N[q].z,">,<",P[q+nI].x,",",P[q+nI].y,",",P[q+nI].z,">,<",N[q+nI].x,",",N[q+nI].y,",",N[q+nI].z,">,<",P[q+nI+1].x,",",P[q+nI+1].y,",",P[q+nI+1].z,">,<",N[q+nI+1].x,",",N[q+nI+1].y,",",N[q+nI+1].z,">}\\n")
         #else
            smooth_triangle{P[q],N[q],P[q+1],N[q+1],P[q+nI+1],N[q+nI+1]}
            smooth_triangle{P[q],N[q],P[q+nI],N[q+nI],P[q+nI+1],N[q+nI+1]}
         #end

    #else        
         #if (dofile=true)
             #write(filehandle,"triangle{<",P[q].x,",",P[q].y,",",P[q].z,">,<",P[q+1].x,",",P[q+1].y,",",P[q+1].z,">,<",P[q+nI+1].x,",",P[q+nI+1].y,",",P[q+nI+1].z,">}\\n")
             #write(filehandle,"triangle{<",P[q].x,",",P[q].y,",",P[q].z,">,<",P[q+nI].x,",",P[q+nI].y,",",P[q+nI].z,">,<",P[q+nI+1].x,",",P[q+nI+1].y,",",P[q+nI+1].z,">}\\n")
         #else                        
             triangle{P[q],P[q+1],P[q+nI+1]}
             triangle{P[q],P[q+nI],P[q+nI+1]}
         #end
    #end       
#end
#local q=q+1;#end

#end
// --------------------------------------
// End of the MakeBlade macro
//==============================================

//==============================================
// MakeGrassPatch macro
//==============================================
// The MakeGrassPatch macro creates a grass patch by creating
// individual blades with the MakeBlade macro
// The resulting patch is a mesh of nBlade*nBlade individual blades
// Its size is lPatch*lPatch                    
// The main tuning parameters are segBlade and nBlade (keep low to test) 
// --------------------------------------
// Patch parameters
// --------------------------------------
/*
#declare lPatch=50;               // size of patch
#declare nBlade=40;               // number of blades per line
#declare ryBlade = 60;            // initial y rotation of blade
#declare segBlade= 15;            // number of blade segments
#declare lBlade = 15;             // length of blade
#declare wBlade = 1;              // width of blade at start
#declare wBladeEnd = 0.3;         // width of blade at the end
#declare doSmooth=false;          // true makes smooth triangles
#declare startBend = <0,1,0.3>;   // bending of blade at start (<0,1,0>=no bending)
#declare vBend = <0,-1,2>;       // direction of the force bending the blade (<0,1,1> = 45�)
#declare pwBend = 3;             // bending power (how slowly the curve bends)
#declare rd = 459;                // seed
#declare stdposBlade = 1;         // standard deviation of blade position 0..1
#declare stdrotBlade = 360;       // standard deviation of rotation
#declare stdBlade = 3;           // standard deviation of blade scale;
#declare stdBend = 0;             // standard deviation of blade bending;
#declare dofold = false;          // true creates a central fold in the blade (twice more triangles)
#declare dofile = true;           // true creates a mesh file
#declare fname = "fgrass.inc"     // name of the mesh file to create
// --------------------------------------
*/
// -------------------------------------------------------------------------------------------------------
#macro MakeGrassPatch( lPatch,      //   50, // size of patch
                       nBlade,      //   40, // number of blades per line
                       ryBlade,     //   60, // initial y rotation of blade
                       segBlade,    //   15, // number of blade segments
                       lBlade,      //   15, // length of blade
                       wBlade,      //    1, // width of blade at start
                       wBladeEnd,   //  0.3, // width of blade at the end

                       doSmooth,  // 0 or 1, // true or 1 makes smooth triangles   
                       startBend,//<0,1,0.3>,// bending of blade at start (<0,1,0>=no bending)
                       vBend,    //<0,-1,2>, // direction of the force bending the blade (<0,1,1> = 45�)
                       pwBend,      //    3, // bending power (how slowly the curve bends)
                       rd,          //18264, // random seed
                       stdposBlade, // 0..1, // standard deviation of blade position
                       stdrotBlade, //  360, // standard deviation of rotation
                       stdBlade,    //    3, // standard deviation of blade scale
                       stdBend,     //    0, // standard deviation of blade bending
                       dofold,     //0 or 1, // true or 1 creates a central fold in the blade (twice more triangles)
                       dofile,     //0 or 1, // true or 1 creates a mesh file
                       fname  // "grass_01.inc" // string, name of the mesh file to create
                     ) //-------------------------------------------------------------------------------
#if(dofile=true)          
        #warning concat(fname," mesh file creation starts\\n")

        #fopen filehandle fname write  // creates the leaf mesh (individual leaf)
        #write(filehandle,"mesh{\\n")
        #else
        mesh{
#end
#local iBlade=lPatch/(nBlade-1);
#local s1=seed(rd);
#local zCount=0;
#while (zCount<nBlade)
        #local xCount=0;                          
        
        #while (xCount<nBlade)                                          

                #local posBlade=<xCount*iBlade,0,zCount*iBlade>+<iBlade*(0.5-rand(s1))*stdposBlade,0,iBlade*(0.5-rand(s1))*stdposBlade>;
                #local rotBlade=ryBlade+(0.5-rand(s1))*stdrotBlade;
//                #local lBladetmp=max(lBlade*0.3,lBlade+(0.5-rand(s1))*stdlBlade);     
                #local scBlade=max(0.5,(0.5-rand(s1))*stdBlade*2);
                #local lBladetmp=lBlade*scBlade;     
                #local xBladeStart=wBlade*scBlade;
                #local xBladeEnd=wBladeEnd*scBlade;
                #local zBladeStart=xBladeStart*0.5;
                #local vBendtmp=vBend + <(0.5-rand(s1))*0.3,0.5-rand(s1),rand(s1)>*stdBend;
                MakeBlade(doSmooth,posBlade,rotBlade,segBlade,lBladetmp,xBladeStart,xBladeEnd,zBladeStart,startBend,vBendtmp,pwBend,dofold,dofile)
                #warning concat("blade ",str(zCount*nBlade+xCount+1,0,0),"/",str(nBlade*nBlade,0,0),"\\n")

                #local xCount=xCount+1;
        #end
        #local zCount=zCount+1;
#end

#if(dofile = true)
        #write (filehandle,"translate <",-lPatch/2,",0,",-lPatch/2,">}\\n")
        #fclose filehandle
        #warning concat(fname," file created\\n")
#else
        translate <-lPatch/2,0,-lPatch/2>
        }
        
#end

#end
// --------------------------------------
// End of the MakeGrassPatch macro
//==============================================


//===============================================
// MakePrairie macro
// --------------------------------------
// The MakePrairie macro creates a prairie by collating patches
// along the z axis, starting with nxPrairie patches and adding addPatches patches
// at each line, so that the prairie gets wider
// Because the patch is a mesh object, you can have multiple copies of it without
// running out of memory too soon
// --------------------------------------
/*
#declare lPatch=50; //size of individual patches
#declare nxPrairie=3; //number of patches for the first line
#declare addPatches=1; //number of patches to add at each line
#declare nzPrairie=5; //number of lines of patches
#declare objectPatch=GrassPatch; //patch object
#declare rd=seed(779);  // random seed
#declare stdscale=1; // stddev of scale
#declare stdrotate=1; // stddev of rotation
#declare doTest=false; // replaces the patch with a sphere
// --------------------------------------
*/
//-----------------------------------------------------------------------------------
#macro MakePrairie( lPatch,     // 50, // size of individual patches
                    nxPrairie,  //  3, // number of patches for the first line
                    addPatches, //  1, // number of patches to add at each line
                    nzPrairie,  //  5, // number of lines of patches
                    objectPatch,// GrassPatch, // the name of the patch object
                    rd,         //779, // random seed
                    stdscale,   //  1, // stddev of scale
                    stdrotate,  //  1, // stddev of rotation
                    doTest      //  0 or 1, // replaces the patch with a sphere
                  ) //---------------------------------------------------------------
union{
#local zCount=0;
#local nxCounttmp=nxPrairie;
#local s2=seed(rd);
#while (zCount<nzPrairie)                            
        #local xCount=0;
        
        #while (xCount<nxCounttmp)
                
                #if (doTest=true)
//                        sphere{<-nxCounttmp*0.5+xCount,0,zCount>*lPatch,lPatch*0.5 pigment{Red} scale <1,0.2,1>}
                        sphere{0,lPatch*0.5 pigment{Red} scale <1,0.2,1>
                        scale (1+stdscale*rand(s2)) rotate y*360*(0.5-rand(rd))*stdrotate 
                        translate <xCount-(nxCounttmp-1)*0.5,0,zCount>*lPatch}
                #else
                        object{ objectPatch 
                                scale (1+stdscale*rand(s2)) 
                                rotate y*360*(0.5-rand(s2))*stdrotate 
                                translate <-(nxCounttmp-1)*0.5+xCount,0,zCount>*lPatch}
                #end
                #local xCount=xCount+1;
        #end
        #local nxCounttmp=nxCounttmp+addPatches;
        #local zCount=zCount+1;
#end
}
#end

//-----------------------------------------------
// End of MakePrairie macro
//===============================================

#version makegrass_Inc_Temp;
#end
// End of "makegrass.inc" -----------------------
`,
    'math.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: math.inc
//    Last updated: 2004.07.23
//    Description: This file contains various math macros and functions

#ifndef(MATH_INC_TEMP)
#declare MATH_INC_TEMP = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
   #debug "including math.inc\\n"
#end

#include "functions.inc"

// --------------------------------------------------------
// Statistics macros: (some from variate.inc)
// --------------------------------------------------------

// Mean(rewritten, original from basemcr.inc by Margus Ramst)
#macro Mean(A)
   #local N = dimension_size(A,1);
   #local C = 0;
//    (
//    #while(C<N-1)
//        A[C]+
//        #local C=C+1;
//    #end
//    A[C])/N
   #local V = 0;
   #while(C < N)
      #local V = V + A[C];
      #local C=C+1;
   #end
   (V/N)
#end

// Standard deviation(rewritten, original from basemcr.inc by Margus Ramst)
#macro Std_Dev(A, M)
   #local N = dimension_size(A,1);
   #local C = 0;
//    sqrt((
//    #while(C<N-1)
//        pow(A[C]-M,2)+
//        #local C=C+1;
//    #end
//    pow(A[C]-M,2))/N)
   #local V = 0;
   #while(C < N)
      #local V = V + pow(A[C] - M, 2);
      #local C=C+1;
   #end
   sqrt(V/N)
#end

// Macros for statistical analysis
// Input: an array of values
// Output: a global array "StatisticsArray" is
//         declared containing: N, Mean, Min, Max, StdDev
#macro GetStats(ValArr)
   #local SquareSum=0; #local Sum=0;
   #local Min=10e15;   #local Max=-10e15;
   #local N=dimension_size(ValArr,1);
   #local I=0;
   #while (I<N)
      #local Val=ValArr[I];
      #local Sum=Sum+Val;
      #local SquareSum=SquareSum+(Val*Val);
      #if (Val>Max)
         #local Max=Val;
      #end
      #if (Val<Min)
         #local Min=Val;
      #end
      #local I=I+1;
   #end
   #local Avg=Sum/N;
   #local StdDev=sqrt((SquareSum/N)-Avg*Avg);
   #debug concat("\\nN      = ",str(N,0,0),"\\n")
   #debug concat("Mean   = ",str(Avg,0,-1),"\\n")
   #debug concat("Min    = ",str(Min,0,-1),"\\n")
   #debug concat("Max    = ",str(Max,0,-1),"\\n")
   #debug concat("StdDev = ",str(StdDev,0,-1),"\\n")
   #declare StatisticsArray=array[5]{N,Avg,Min,Max,StdDev}
#end

// Input: an array with values and the wanted amount of intervals / bins.
// Output: a global array "HistogramArray" is declared,
//         it is a two dimensional array, the first value is the center
//         of the interval / bin, the second the amount of values
//         in that interval.
#macro Histogram(ValArr, Intervals)
   GetStats(ValArr)
   #local Min=StatisticsArray[2];
   #local Max=StatisticsArray[3];

   #local Intervals=int(Intervals);
   #local Width=(Max-Min)/(Intervals);

   #local HistArr=array[Intervals][2]
   #local I=0;
   #while(I<Intervals)
      #local HistArr[I][0]=Min+Width*(I+0.5);  // center of interval
      #local HistArr[I][1]=0;
      #local I=I+1;
   #end

   #local I=0;
   #while (I<N)                                // 'put' the values into the right
      #local Index=int((ValArr[I]-Min)/Width); // intervals and count them.
      #if (Index>=Intervals)
         #local Index=Index-1;
      #end
      #local HistArr[Index][1]=HistArr[Index][1]+1;
      #local I=I+1;
   #end
   #declare HistogramArray=HistArr
#end


// --------------------------------------------------------
// Trig:
// --------------------------------------------------------

#declare sind = function (x) {sin(radians(x))}
#declare cosd = function (x) {cos(radians(x))}
#declare tand = function (x) {tan(radians(x))}

#declare asind = function (x) {degrees(asin(x))}
#declare acosd = function (x) {degrees(acos(x))}
#declare atand = function (x) {degrees(atan(x))} 
#declare atan2d = function (x, y) {degrees(atan2(x, y))}


// --------------------------------------------------------
// Misc:
// --------------------------------------------------------

#declare max3 = function (x, y, z) {max(x,y,z)}
#declare min3 = function (x, y, z) {min(x,y,z)}

#declare even = function(x) {select(mod(x, 2), 0, 1, 0)}
#declare odd  = function(x) {select(mod(x, 2), 1, 0, 1)}

// Squares the value
#declare f_sqr = function (x) {(x*x)}

// Returns the sign of a value
#declare sgn = function (x) {select(x,-1, 0, 1)}
//#declare sgn = function (x) {x/abs(x)}

// Range handling
// clips a number (x) to the range [Min, Max] ([y, z]). Values above Max return Max,
// below Min return Min.
#declare clip = function (x, y, z) {min(z, max(x, y))}

// Clamps a number (x) to the range [Min, Max] ([y, z]).
// Values outside this range wrap around.
#declare clamp = function (x, y, z) {mod(x - y, z - y) + select(mod(x - y, z - y), z, y)}

// Adjusts input values (x) in the range [0, 1] to output values in range [Rmn, Rmx] ([y, z]).
#declare adj_range = function (x, y, z) {x*(z - y) + y}

// Adjusts values in a specified range [Rmn, Rmx] to the specified range [Min, Max]
#declare adj_range2 = 
  function (x, y, z, _Math_INC_OMn, _Math_INC_OMx) {
    ((x - y)/(z - y))*(_Math_INC_OMx - _Math_INC_OMn) + _Math_INC_OMn
  }

// Interpolate author: Margus Ramst
// Interpolation
// GC - global current
// GS - global start
// GE - global end
// TS - target start
// TE - target end
// Method - interpolation method:
//          Method = 0 - cosine interpolation
//          Method > 0 - exponential (1 - linear, etc)
#macro Interpolate(GC, GS, GE, TS, TE, Method)
   (#if(Method!=0)
      (TS+(TE-TS)*pow((GC-GS)/(GE-GS),Method))
   #else
      #local X=(GC-GS)/(GE-GS);
      #local F=(1-cos(X*pi))*.5;
      (TS*(1-F)+TE*F)
   #end)
#end

// --------------------------------------------------------
// Vector macros:
// --------------------------------------------------------

// Squares the components of a vector
#macro VSqr(V) (V*V) #end

// Raises the components of a vector to a given power
#macro VPow(V, P) <pow(V.x, P), pow(V.y, P), pow(V.z, P)> #end
#macro VPow5D(V, P) <pow(V.x, P), pow(V.y, P), pow(V.z, P), pow(V.filter, P), pow(V.transmit, P)> #end

// Returns true if vectors are equal, otherwise false
#macro VEq(V1, V2) (V1.x = V2.x & V1.y = V2.y & V1.z = V2.z) #end
#macro VEq5D(V1, V2)
   ( V1.x = V2.x
   & V1.y = V2.y
   & V1.z = V2.z
   & V1.filter = V2.filter
   & V1.transmit = V2.transmit)
#end

// Returns true if vector is <0,0,0>, otherwise false
#macro VZero(V1) (V1.x = 0 & V1.y = 0 & V1.z = 0) #end
// Returns true if vector is <0,0,0,0,0>, otherwise false
#macro VZero5D(V1) (V1.x = 0 & V1.y = 0 & V1.z = 0 & V1.filter = 0 & V1.transmit = 0) #end

#macro VLength5D(V) sqrt(V.x*V.x + V.y*V.y + V.z*V.z + V.filter*V.filter + V.transmit*V.transmit) #end

#macro VNormalize5D(V) (V/sqrt(V.x*V.x + V.y*V.y + V.z*V.z + V.filter*V.filter + V.transmit*V.transmit)) #end

#macro VDot5D(V1, V2) (V1.x*V2.x + V1.y*V2.y + V1.z*V2.z + V1.filter*V2.filter + V1.transmit*V2.transmit) #end

// Cosine of angle between V1 and V2
#macro VCos_Angle(V1, V2) vdot(vnormalize(V1), vnormalize(V2)) #end

// Angle in radians between V1 and V2
#macro VAngle(V1, V2) acos(min(1, vdot(vnormalize(V1), vnormalize(V2)))) #end
// Angle in degrees between V1 and V2
#macro VAngleD(V1, V2) degrees(acos(min(1,vdot(vnormalize(V1), vnormalize(V2))))) #end

// VRotation() will find the rotation angle from V1 to V2
// around Axis. Axis should be perpendicular to both V1
// and V2. The output will be in the range between -pi and
// pi radians or between -180 degrees and 180 degrees if
// you are using the degree version. However, if Axis is
// set to <0,0,0> the output will always be positive or
// zero, the same result you will get with the VAngle() macros.
// Author: Rune S. Johansen
#macro VRotation(V1, V2, Axis)
   (acos(min(vdot(vnormalize(V1),vnormalize(V2)),1))
   *(vdot(Axis,vcross(V1,V2))<0?-1:1))
#end
#macro VRotationD(V1, V2, Axis)
   (degrees(acos(min(vdot(vnormalize(V1),vnormalize(V2)),1)))
   *(vdot(Axis,vcross(V1,V2))<0?-1:1))
#end

// Distance between V1 and V2
#macro VDist(V1, V2) vlength(V1 - V2) #end

// Returns a vector perpendicular to V
// Author: Tor Olav Kristensen
#macro VPerp_To_Vector(v0)
   #if (vlength(v0) = 0)
      #local vN = <0, 0, 0>;
   #else
      #local Dm = min(abs(v0.x), abs(v0.y), abs(v0.z));
      #if (abs(v0.z) = Dm)
         #local vN = vnormalize(vcross(v0, z));
      #else
         #if (abs(v0.y) = Dm)
            #local vN = vnormalize(vcross(v0, y));
         #else
            #local vN = vnormalize(vcross(v0, x));
         #end
      #end
   #end
   vN
#end

// Returns a vector perpendicular to V1 and V2
#macro VPerp_To_Plane(V1, V2) (vnormalize(vcross(V1, V2))) #end

// Find a vector perpendicular to Axis and in the plane of
// V1 and Axis. In other words, the new vector is a version
// of V1 adjusted to be perpendicular to Axis.
#macro VPerp_Adjust(V, Axis)
   vnormalize(vcross(vcross(Axis, V), Axis))
#end

// Projects a vector onto the plane defined by Axis.
// Based on code by Ron Parker
#macro VProject_Plane(V, Axis)
   #local A = vnormalize(Axis);
   (V - vdot(V, A)*A)
#end

// Projects a vector onto the an axis.
// Based on code by Ron Parker
#macro VProject_Axis(V, Axis)
   (Axis*vdot(V, Axis)/vdot(Axis, Axis))
#end

// Smallest component of V
#macro VMin(V) (min3(V.x, V.y, V.z)) #end

// Largest component of V
#macro VMax(V) (max3(V.x, V.y, V.z)) #end

// Creates a vector going in the direction of the
// given vector with the specified length
#macro VWith_Len(V, Len) (Len*vnormalize(V)) #end

// --------------------------------------------------------
// Vector analysis macros
// --------------------------------------------------------
// Authors: Christoph Hormann and Tor Olav Kristensen

// Various functions of vector analysis in form of macros
// that can be used in user defined functions or expressions
//
// all macros make use of a constant named
// '__Gradient_Fn_Accuracy_' for numerical approximation
// of the derivatives.
// This constant can be changed with the
// 'SetGradientAccuracy()' macro, the default value is 0.001.
//
// Because vector functions can only be created as pigment
// or transform/spline functions and can not be passed as
// a macro parameter there is no fn_Curl() function and the
// divergence and curl macros use 3 float functions for
// defining the vector field.

#ifndef (__Gradient_Fn_Accuracy_)
   #declare __Gradient_Fn_Accuracy_=0.001;
#end

#macro SetGradientAccuracy(Value)
   #declare __Gradient_Fn_Accuracy_=abs(Value);
#end

// macro calculating the gradient of a function
// as a function
//
// Parameters:
//     __Gradient_Fn: function to calculate the gradient from
//
// Output: the length of the gradient as a function
#macro fn_Gradient(__Gradient_Fn)

   function {
      f_r(
         __Gradient_Fn(x + __Gradient_Fn_Accuracy_, y, z) - __Gradient_Fn(x - __Gradient_Fn_Accuracy_, y, z),
         __Gradient_Fn(x, y + __Gradient_Fn_Accuracy_, z) - __Gradient_Fn(x, y - __Gradient_Fn_Accuracy_, z),
         __Gradient_Fn(x, y, z + __Gradient_Fn_Accuracy_) - __Gradient_Fn(x, y, z - __Gradient_Fn_Accuracy_)
      )/(2*__Gradient_Fn_Accuracy_)
   }

#end

// macro calculating the gradient of a function
// in one direction as a function
//
// Parameters:
//     __Gradient_Fn:  function to calculate the gradient from
//     Dir:            direction to calculate the gradient
//
// Output: the gradient in that direction as a function
#macro fn_Gradient_Directional(__Gradient_Fn, Dir)

   #local Dirx = vnormalize(Dir).x;
   #local Diry = vnormalize(Dir).y;
   #local Dirz = vnormalize(Dir).z;

   function {
      (
         (__Gradient_Fn(x + __Gradient_Fn_Accuracy_, y, z) - __Gradient_Fn(x - __Gradient_Fn_Accuracy_, y, z))*Dirx +
         (__Gradient_Fn(x, y + __Gradient_Fn_Accuracy_, z) - __Gradient_Fn(x, y - __Gradient_Fn_Accuracy_, z))*Diry +
         (__Gradient_Fn(x, y, z + __Gradient_Fn_Accuracy_) - __Gradient_Fn(x, y, z - __Gradient_Fn_Accuracy_))*Dirz
      )/(2*__Gradient_Fn_Accuracy_)
   }

#end

// macro calculating the divergence of a (vector) function
// as a function
//
// Parameters:
//     __Gradient_Fnx,
//     __Gradient_Fny,
//     __Gradient_Fnz: x, y and z components of a vector function
//
// Output: the divergence as a function
#macro fn_Divergence(__Gradient_Fnx, __Gradient_Fny, __Gradient_Fnz)

   function {
      (
       __Gradient_Fnx(x + __Gradient_Fn_Accuracy_, y, z) - __Gradient_Fnx(x - __Gradient_Fn_Accuracy_, y, z)+
       __Gradient_Fny(x, y + __Gradient_Fn_Accuracy_, z) - __Gradient_Fny(x, y - __Gradient_Fn_Accuracy_, z)+
       __Gradient_Fnz(x, y, z + __Gradient_Fn_Accuracy_) - __Gradient_Fnz(x, y, z - __Gradient_Fn_Accuracy_)
      )/(2*__Gradient_Fn_Accuracy_)
   }

#end

// macro calculating the gradient of a function
// as a vector expression
//
// Parameters:
//     __Gradient_Fn: function to calculate the gradient from
//     p0:            point where to calculate the gradient
//
// Output: the gradient as a vector expression
#macro vGradient(__Gradient_Fn, p0)

  #local p0x=p0.x;
  #local p0y=p0.y;
  #local p0z=p0.z;

   (
    <
     __Gradient_Fn(p0x + __Gradient_Fn_Accuracy_, p0y, p0z) - __Gradient_Fn(p0x - __Gradient_Fn_Accuracy_, p0y, p0z),
     __Gradient_Fn(p0x, p0y + __Gradient_Fn_Accuracy_, p0z) - __Gradient_Fn(p0x, p0y - __Gradient_Fn_Accuracy_, p0z),
     __Gradient_Fn(p0x, p0y, p0z + __Gradient_Fn_Accuracy_) - __Gradient_Fn(p0x, p0y, p0z - __Gradient_Fn_Accuracy_)
    >/(2*__Gradient_Fn_Accuracy_)
   )

#end

// macro calculating the curl of a (vector) function
// as a vector expression
//
// Parameters:
//     __Gradient_Fnx,
//     __Gradient_Fny,
//     __Gradient_Fnz: x, y and z components of a vector function
//     p0:             point where to calculate the curl
//
// Output: the curl as a vector expression
#macro vCurl(__Gradient_Fnx, __Gradient_Fny, __Gradient_Fnz, p0)

  #local p0x=p0.x;
  #local p0y=p0.y;
  #local p0z=p0.z;
  
  (
    <
      __Gradient_Fnz(p0x, p0y + __Gradient_Fn_Accuracy_, p0z) - __Gradient_Fnz(p0x, p0y - __Gradient_Fn_Accuracy_, p0z) -
      __Gradient_Fny(p0x, p0y, p0z + __Gradient_Fn_Accuracy_) + __Gradient_Fny(p0x, p0y, p0z - __Gradient_Fn_Accuracy_),
      
      __Gradient_Fnx(p0x, p0y, p0z + __Gradient_Fn_Accuracy_) - __Gradient_Fnx(p0x, p0y, p0z - __Gradient_Fn_Accuracy_) -
      __Gradient_Fnz(p0x + __Gradient_Fn_Accuracy_, p0y, p0z) + __Gradient_Fnz(p0x - __Gradient_Fn_Accuracy_, p0y, p0z),

      __Gradient_Fny(p0x + __Gradient_Fn_Accuracy_, p0y, p0z) - __Gradient_Fny(p0x - __Gradient_Fn_Accuracy_, p0y, p0z) -
      __Gradient_Fnx(p0x, p0y + __Gradient_Fn_Accuracy_, p0z) + __Gradient_Fnx(p0x, p0y - __Gradient_Fn_Accuracy_, p0z)
    >/(2*__Gradient_Fn_Accuracy_)
  )

#end

// macro calculating the divergence of a (vector) function
// as a float expression
//
// Parameters:
//     __Gradient_Fnx,
//     __Gradient_Fny,
//     __Gradient_Fnz: x, y and z components of a vector function
//     p0:             point where to calculate the divergence
//
// Output: the divergence as a float expression
#macro Divergence(__Gradient_Fnx, __Gradient_Fny, __Gradient_Fnz, p0)

  #local p0x=p0.x;
  #local p0y=p0.y;
  #local p0z=p0.z;
  
   (
    (
     __Gradient_Fnx(p0x + __Gradient_Fn_Accuracy_, p0y, p0z) - __Gradient_Fnx(p0x - __Gradient_Fn_Accuracy_, p0y, p0z)+
     __Gradient_Fny(p0x, p0y + __Gradient_Fn_Accuracy_, p0z) - __Gradient_Fny(p0x, p0y - __Gradient_Fn_Accuracy_, p0z)+
     __Gradient_Fnz(p0x, p0y, p0z + __Gradient_Fn_Accuracy_) - __Gradient_Fnz(p0x, p0y, p0z - __Gradient_Fn_Accuracy_)
    )/(2*__Gradient_Fn_Accuracy_)
   )

#end

// macro calculating the length of the gradient
// of a function as a float expression
//
// Parameters:
//     __Gradient_Fn:  function to calculate the gradient from
//     p0:             point where to calculate the gradient
//
// Output: the length of the gradient as a float expression
#macro Gradient_Length(__Gradient_Fn, p0)
   vlength(vGradient( function { __Gradient_Fn(x, y, z) } , p0))
#end

// macro calculating the gradient of a function
// in one direction as a float expression
//
// Parameters:
//     __Gradient_Fn:  function to calculate the gradient from
//     p0:             point where to calculate the gradient
//     Dir:            direction to calculate the gradient
//
// Output: the gradient in that direction as a float expression
#macro Gradient_Directional(__Gradient_Fn, p0, Dir)
   vdot(
      vGradient( function { __Gradient_Fn(x, y, z) }, p0),
      vnormalize(Dir)
   )
#end

#version MATH_INC_TEMP;
#end//math.inc

`,
    'meshmaker.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

// Persistence of Vision Ray Tracer Include File
// File: meshmaker.inc
// Vers: 3.7
// 
// Desc: Macros and functions used in builing mesh2 objects.
// Packed together and updated for POV-Ray 3.7 
// by Friedrich A. Lohmueller, April-2013.
// Original author: Ingo Janssen 
// Date: 2002/04/27
// Rev 2002/10/23 : Added the CheckFileName macro.
//                  Added the option to write Wavefront *.obj files.
//                  Added the option to write *.pcm files, for Chris Colefax' Compressed Mesh Macros.
//                  Added the option to write *.arr files, this writes only the arrays to a file.
// Added SweepSpline1() and SweepSpline2() by Mike Williams, based on an idea by Greg M. Johnson.
// Rev 2015/08/01 : Fixed the position of the #version statement.



#ifndef(makemesh_Inc_Temp)
#declare makemesh_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
   #debug "including makemesh.inc\\n"
#end


//====== Macros and Functions ======//

/*==============
LInterpolate() : Linear interpolation of a vector or float between Min and Max.
Min : minimal float value or vector.
Max : Maximal float value or vector.
Val : A float in the range 0 - 1.
*/   
   #macro LInterpolate(Val, Min, Max)
      (Min+(Max-Min)*Val) 
   #end


/*=========
RangeMM() : Adjusts input values in the range [RMin, RMax] to fit in the range
[Min, Max].
Val : A float value in the range [Rmin, Rmax].
*/   
   #declare RangeMM=function(Val,Rmin,Rmax,Min,Max){
      (((Val-Rmin)/(Rmax-Rmin))*(Max-Min)+Min)
   }

/*=================
  If Return has a value of 0 the mesh will not be build,
  but it will be parsed from file. 
*/
#macro CheckFileName(FileName)
   #local Len=strlen(FileName);
   #if(Len>0)
      #if(file_exists(FileName))
         #if(Len>=4)
            #local Ext=strlwr(substr(FileName,Len-3,4))
            #if (strcmp(Ext,".obj")=0 | strcmp(Ext,".pcm")=0 | strcmp(Ext,".arr")=0)
               #local Return=99;
            #else
               #local Return=0;
            #end  
         #else
            #local Return=0;
         #end
      #else
         #if(Len>=4)
            #local Ext=strlwr(substr(FileName,Len-3,4))
            #if (strcmp(Ext,".obj")=0 | strcmp(Ext,".pcm")=0 | strcmp(Ext,".arr")=0)
               #if (strcmp(Ext,".obj")=0)
                  #local Return=2;
               #end
               #if (strcmp(Ext,".pcm")=0)
                  #local Return=3;
               #end
               #if (strcmp(Ext,".arr")=0)
                  #local Return=4;
               #end
            #else
               #local Return=1;
            #end  
         #else
            #local Return=1;
         #end
      #end
   #else
      #local Return=1;
   #end
   (Return)
#end

/*================= 
BuildWriteMesh2() : Builds and optionally writes a mesh2 object based on 3 input
arrays, the number of quads in U and V direction and a filename.
VecArr   : The array that contains the vertices of the triangles in the mesh.
NormArr  : The array with the normal vectors that go with the vertices.
UVArr    : The array containing the uv_vectors.
U        : The amount of subdivisions of the surface in the u-direction.
V        : The amount of subdivisions in the v-direction.
           Based on the U and V values the face_indices of the  triangles in the
           mesh are calculated.
FileName : The name of the file to which the mesh will be written. If is an
           empty string (""), no file will be written.
           If the file extension is 'obj' a Wavefront objectfile will be written.
           If the extension is 'pcm' a compressed mesh file is written.
           If a file name is given, the macro will first check if it already exists.
           If that is so, it will try to parse the existing file unless it's a '*.obj',
           '*.pcm' or '*.arr' file as POV-Ray can not read them directly. In this case a new
           mesh will be generated, but the existing files will _not_ be over-written.
*/
   #macro BuildWriteMesh2(VecArr, NormArr, UVArr, U, V, FileName)
      #if(strlen(FileName)!=0)
         #local Write=CheckFileName(FileName);
         #if(Write=99)
            #local Write=0;
         #end
         #if (Write=0)
            #debug concat(
               "\\n\\n The exis","ting file: '", FileName ,"' will not be over-written\\n",
               " The mesh2 will not be parsed from the ", FileName," file",
               "\\n   - vertex_vectors\\n")   
         #else
            #debug concat(
               "\\n\\n Building mesh2 & Writing file: '", FileName , 
               "'\\n   - vertex_vectors\\n"
            )
            #fopen MeshFile FileName write
            #switch (Write)
               #case(1)
                  #write(
                     MeshFile,
                     "#declare Surface = mesh2 {\\n"
                  )
               #break
               #case(2)
                  #write(
                     MeshFile,
                     "# File: ",FileName,"\\n",
                  )
               #break
               #case(3)
                  #write(
                     MeshFile,
                     "\\"PCM1\\",\\n"
                  )
               #break
               #case(4)
                  #write(
                     MeshFile,
                     "// Arrays for building a mesh2{} object.\\n",
                     "// the arrays are declared with the following names:\\n",
                     "// VertexVectors, NormalVectors, UVVectors and FaceIndices.\\n\\n"
                  )
               #break
            #end
         #end
      #else
         #local Write=0;
         #debug concat("\\n\\n Building mesh2: \\n   - vertex_vectors\\n")   
      #end
     
      #local NumVertices=dimension_size(VecArr,1);
      #switch (Write)
         #case(1)
            #write(
               MeshFile,
               "  vertex_vectors {\\n",
               "    ", str(NumVertices,0,0),"\\n    "
            )
         #break
         #case(2)
            #write(
               MeshFile,
               "# Vertices: ",str(NumVertices,0,0),"\\n"
            )
         #break
         #case(3)
            #write(
               MeshFile,
               str(2*NumVertices,0,0),",\\n"
            )
         #break
         #case(4)
            #write(
               MeshFile,
               "#declare VertexVectors= array[",str(NumVertices,0,0),"] {\\n  "
            )
         #break
      #end
      mesh2 {
         vertex_vectors {
            NumVertices
            #local I=0;
            #while (I<NumVertices)
               VecArr[I]
               #switch(Write)
                  #case(1)
                     #write(MeshFile, VecArr[I])
                  #break
                  #case(2)
                     #write(
                        MeshFile,
                        "v ", VecArr[I].x," ", VecArr[I].y," ", VecArr[I].z,"\\n"
                     )
                  #break
                  #case(3)
                     #write(
                        MeshFile,
                        VecArr[I].x,",", VecArr[I].y,",", VecArr[I].z,",\\n"
                     )
                  #break
                  #case(4)
                     #write(MeshFile, VecArr[I])
                  #break
               #end
               #local I=I+1;
               #if(Write=1 | Write=4)
                  #if(mod(I,3)=0)
                     #write(MeshFile,"\\n    ")
                  #end
               #end 
            #end
            #switch(Write)
               #case(1) 
                  #write(MeshFile,"\\n  }\\n")
               #break
               #case(2)
                  #write(MeshFile,"\\n")
               #break
               #case(3)
                  // do nothing
               #break
               #case(4) 
                  #write(MeshFile,"\\n}\\n")
               #break
            #end
         }
   
         #debug concat("   - normal_vectors\\n")     
         #local NumVertices=dimension_size(NormArr,1);
         #switch(Write)
            #case(1)
               #write(
                  MeshFile,
                  "  normal_vectors {\\n",
                  "    ", str(NumVertices,0,0),"\\n    "
               )
            #break
            #case(2)
               #write(
                  MeshFile,
                  "# Normals: ",str(NumVertices,0,0),"\\n"
               )
            #break
            #case(3)
               // do nothing
            #break
            #case(4)
               #write(
                  MeshFile,
                  "#declare NormalVectors= array[",str(NumVertices,0,0),"] {\\n  "
               )
            #break
         #end
         normal_vectors {
            NumVertices
            #local I=0;
            #while (I<NumVertices)
               NormArr[I]
               #switch(Write)
                  #case(1)
                     #write(MeshFile NormArr[I])
                  #break
                  #case(2)
                     #write(
                        MeshFile,
                        "vn ", NormArr[I].x," ", NormArr[I].y," ", NormArr[I].z,"\\n"
                     )
                  #break
                  #case(3)
                     #write(
                        MeshFile,
                        NormArr[I].x,",", NormArr[I].y,",", NormArr[I].z,",\\n"
                     )
                  #break
                  #case(4)
                     #write(MeshFile NormArr[I])
                  #break
               #end
               #local I=I+1;
               #if(Write=1 | Write=4) 
                  #if(mod(I,3)=0)
                     #write(MeshFile,"\\n    ")
                  #end
               #end 
            #end
            #switch(Write)
               #case(1)
                  #write(MeshFile,"\\n  }\\n")
               #break
               #case(2)
                  #write(MeshFile,"\\n")
               #break
               #case(3)
                  //do nothing
               #break
               #case(4)
                  #write(MeshFile,"\\n}\\n")
               #break
            #end
         }
         
         #debug concat("   - uv_vectors\\n")   
         #local NumVertices=dimension_size(UVArr,1);
         #switch(Write)
            #case(1)
               #write(
                  MeshFile, 
                  "  uv_vectors {\\n",
                  "    ", str(NumVertices,0,0),"\\n    "
               )
             #break
             #case(2)
               #write(
                  MeshFile,
                  "# UV-vectors: ",str(NumVertices,0,0),"\\n"
               )
             #break
             #case(3)
               // do nothing, *.pcm does not support uv-vectors
             #break
             #case(4)
                #write(
                   MeshFile,
                   "#declare UVVectors= array[",str(NumVertices,0,0),"] {\\n  "
                )
             #break
         #end
         uv_vectors {
            NumVertices
            #local I=0;
            #while (I<NumVertices)
               UVArr[I]
               #switch(Write)
                  #case(1)
                     #write(MeshFile UVArr[I])
                  #break
                  #case(2)
                     #write(
                        MeshFile,
                        "vt ", UVArr[I].u," ", UVArr[I].v,"\\n"
                     )
                  #break
                  #case(3)
                     //do nothing
                  #break
                  #case(4)
                     #write(MeshFile UVArr[I])
                  #break
               #end
               #local I=I+1; 
               #if(Write=1 | Write=4)
                  #if(mod(I,3)=0)
                     #write(MeshFile,"\\n    ")
                  #end 
               #end
            #end 
            #switch(Write)
               #case(1)
                  #write(MeshFile,"\\n  }\\n")
               #break
               #case(2)
                  #write(MeshFile,"\\n")
               #break
               #case(3)
                  //do nothing
               #break
               #case(4)
                  #write(MeshFile,"\\n}\\n")
               #break
            #end
         }
   
         #debug concat("   - face_indices\\n")   
         #declare NumFaces=U*V*2;
         #switch(Write)
            #case(1)
               #write(
                  MeshFile,
                  "  face_indices {\\n"
                  "    ", str(NumFaces,0,0),"\\n    "
               )
            #break
            #case(2)
               #write (
                  MeshFile,
                  "# faces: ",str(NumFaces,0,0),"\\n"
               )
            #break
            #case(3)
               #write (
                  MeshFile,
                  "0,",str(NumFaces,0,0),",\\n"
               )
            #break
            #case(4)
               #write(
                  MeshFile,
                  "#declare FaceIndices= array[",str(NumFaces,0,0),"] {\\n  "
               )
            #break
         #end
         face_indices {
            NumFaces
            #local I=0;
            #local H=0;
            #local NumVertices=dimension_size(VecArr,1);
            #while (I<V)
               #local J=0;
               #while (J<U)
                  #local Ind=(I*U)+I+J;
                  <Ind, Ind+1, Ind+U+2>, <Ind, Ind+U+1, Ind+U+2>
                  #switch(Write)
                     #case(1)
                        #write(
                           MeshFile,
                           <Ind, Ind+1, Ind+U+2>, <Ind, Ind+U+1, Ind+U+2>
                        )
                     #break
                     #case(2)
                        #write(
                           MeshFile,
                           "f ",Ind+1,"/",Ind+1,"/",Ind+1," ",Ind+1+1,"/",Ind+1+1,"/",Ind+1+1," ",Ind+U+2+1,"/",Ind+U+2+1,"/",Ind+U+2+1,"\\n",
                           "f ",Ind+U+1+1,"/",Ind+U+1+1,"/",Ind+U+1+1," ",Ind+1,"/",Ind+1,"/",Ind+1," ",Ind+U+2+1,"/",Ind+U+2+1,"/",Ind+U+2+1,"\\n"
                        )
                     #break
                     #case(3)
                        #write(
                           MeshFile,
                           Ind,",",Ind+NumVertices,",",Ind+1,",",Ind+1+NumVertices,",",Ind+U+2,",",Ind+U+2+NumVertices,",\\n"
                           Ind+U+1,",",Ind+U+1+NumVertices,",",Ind,",",Ind+NumVertices,",",Ind+U+2,",",Ind+U+2+NumVertices,",\\n"
                        )
                     #break
                     #case(4)
                        #write(
                           MeshFile,
                           <Ind, Ind+1, Ind+U+2>, <Ind, Ind+U+1, Ind+U+2>
                        )
                     #break
                  #end
                  #local J=J+1;
                  #local H=H+1;
                  #if(Write=1 | Write=4)
                     #if(mod(H,3)=0)
                        #write(MeshFile,"\\n    ")
                     #end 
                  #end
               #end
               #local I=I+1;
            #end
         }
         #switch(Write)
            #case(1)
               #write(MeshFile, "\\n  }\\n}")
               #fclose MeshFile
               #debug concat(" Done writing\\n")
            #break
            #case(2)
               #fclose MeshFile
               #debug concat(" Done writing\\n")
            #break
            #case(3)
               #fclose MeshFile
               #debug concat(" Done writing\\n")
            #break
            #case(4)
               #write(MeshFile, "\\n}\\n}")
               #fclose MeshFile
               #debug concat(" Done writing\\n")
            #break
         #end
      }
   #end

//====== End of Macros and Functions ======// former "meshmaker.inc"

// former "msm.inc"

/*======   
The uv_coordinates come from the square <0,0> - <1,1>.

           The spline is evaluated from t=0 to t=1. For the normal calculation,
           it is required that all splines (also linear_spline) have one extra
           point before t=0 and after t=1.
*/
#macro BuildSpline(Arr, SplType)
   #local Ds=dimension_size(Arr,1);
   #local Asc=asc(strupr(SplType));
   #if(Asc!=67 & Asc!=76 & Asc!=81) 
      #local Asc=76;
      #debug "\\nWrong spline type defined (C/c/L/l/N/n/Q/q), using default linear_spline\\n"
   #end
   spline {
      #switch (Asc)
         #case (67) //C  cubic_spline
            cubic_spline
         #break
         #case (76) //L  linear_spline
            linear_spline
         #break
         #case (78) //N  linear_spline
            natural_spline
         #break
         #case (81) //Q  Quadratic_spline
            quadratic_spline
         #break
      #end
      #local Add=1/((Ds-2)-1);
      #local J=0-Add;
      #local I=0;
      #while (I<Ds)
         J 
         Arr[I]
         #local I=I+1;
         #local J=J+Add;
      #end
   }      
#end

#macro MSM(SplineArray, SplRes, Interp_type,  InterpRes, FileName)
   #declare Build=CheckFileName(FileName);
   #if(Build=0)
      #debug concat("\\n Parsing mesh2 from file: ", FileName, "\\n")
      #include FileName
      object{Surface}
   #else
      #local NumVertices=(SplRes+1)*(InterpRes+1);
      #local NumFaces=SplRes*InterpRes*2;
      #debug concat("\\n Calculating ",str(NumVertices,0,0)," vertices for ", str(NumFaces,0,0)," triangles\\n\\n")
      #local VecArr=array[NumVertices]
      #local NormArr=array[NumVertices]
      #local UVArr=array[NumVertices]
      #local N=dimension_size(SplineArray,1);
      #local TempSplArr0=array[N];
      #local TempSplArr1=array[N];
      #local TempSplArr2=array[N];
      #local PosStep=1/SplRes;
      #local InterpStep=1/InterpRes;
      #local Count=0;
      #local Pos=0;
      #while(Pos<=1)   
         #local I=0;
         #if (Pos=0)
            #while (I<N)
               #local Spl=spline{SplineArray[I]}
               #local TempSplArr0[I]=<0,0,0>+Spl(Pos);
               #local TempSplArr1[I]=<0,0,0>+Spl(Pos+PosStep);
               #local TempSplArr2[I]=<0,0,0>+Spl(Pos-PosStep);
               #local I=I+1;
            #end
            #local S0=BuildSpline(TempSplArr0, Interp_type)
            #local S1=BuildSpline(TempSplArr1, Interp_type)
            #local S2=BuildSpline(TempSplArr2, Interp_type)
         #else
            #while (I<N)
               #local Spl=spline{SplineArray[I]}
               #local TempSplArr1[I]=<0,0,0>+Spl(Pos+PosStep);
               #local I=I+1;
            #end
            #local S1=BuildSpline(TempSplArr1, Interp_type)
         #end
         #local J=0;
         #while (J<=1)
            #local P0=<0,0,0>+S0(J);
            #local P1=<0,0,0>+S1(J);
            #local P2=<0,0,0>+S2(J);
            #local P3=<0,0,0>+S0(J+InterpStep);
            #local P4=<0,0,0>+S0(J-InterpStep);
            #local B1=P4-P0;
            #local B2=P2-P0;
            #local B3=P3-P0;
            #local B4=P1-P0;
            #local N1=vcross(B1,B2);
            #local N2=vcross(B2,B3);
            #local N3=vcross(B3,B4);
            #local N4=vcross(B4,B1);
            #local Norm=vnormalize((N1+N2+N3+N4));
            #local VecArr[Count]=P0;
            #local NormArr[Count]=Norm;
            #local UVArr[Count]=<J,Pos>;
            #local J=J+InterpStep;
            #local Count=Count+1;
         #end
         #local S2=spline{S0}
         #local S0=spline{S1}
         #debug concat("\\r Done ", str(Count,0,0)," vertices : ", str(100*Count/NumVertices,0,2)," %")
         #local Pos=Pos+PosStep;
      #end
      BuildWriteMesh2(VecArr, NormArr, UVArr, InterpRes, SplRes, FileName)
   #end
#end
// ========================== end of former "msm.inc" ======================================

// former param.inc  =======================================================================

#declare EPS=(1e-12);
#declare EPSNorm=(1e-14);

#declare __FU=0; #declare __TU=0;
#declare __FV=0; #declare __TV=0;
#macro FromU(N)#local N=(N+EPS); #declare __FU=1; (N) #end
#macro ToU(N)  #local N=(N-EPS); #declare __TU=1; (N) #end
#macro FromV(N)#local N=(N+EPS); #declare __FV=1; (N) #end
#macro ToV(N)  #local N=(N-EPS); #declare __TV=1; (N) #end

#macro Parametric(__F1__, __F2__, __F3__, UVmin, UVmax, Iter_U, Iter_V, FileName)
   #ifdef(__Fx) #undef __Fx #end
   #ifdef(__Fy) #undef __Fy #end
   #ifdef(__Fz) #undef __Fz #end
   #declare __Fx= function(u,v){__F1__(u,v)} 
   #declare __Fy= function(u,v){__F2__(u,v)}
   #declare __Fz= function(u,v){__F3__(u,v)}
   Paramcalc(UVmin, UVmax, Iter_U, Iter_V, FileName)
#end

#macro Paramcalc(UVmin, UVmax, Iter_U, Iter_V, FileName)
   #declare Build=CheckFileName(FileName);
   #if(Build=0)
      #debug concat("\\n Parsing mesh2 from file: ", FileName, "\\n")
      #include FileName
      object{Surface}
   #else
      #local Umin=UVmin.u; #local Vmin=UVmin.v;
      #local Umax=UVmax.u; #local Vmax=UVmax.v;
      #local dU=Umax-Umin;
      #local dV=Vmax-Vmin;
      #local iU=dU/Iter_U;
      #local iV=dV/Iter_V;
      #local NumVertices=(Iter_U+1)*(Iter_V+1);
      #local NumFaces=Iter_U*Iter_V*2;
      #debug concat("\\n Calculating ",str(NumVertices,0,0)," vertices for ", str(NumFaces,0,0)," triangles\\n\\n")
      #debug "\\n"
      #local VecArr=array[NumVertices] 
      #local NormArr=array[NumVertices] 
      #local UVArr=array[NumVertices]
      #local Count=0;       
      #local I=0;           
      #local V=Vmin-iV;     
      #while (I<Iter_V+1)   
         #local V=V+iV;     
         #local J=0;        
         #local U=Umin-iU;  
         #while (J<Iter_U+1)
            #local U=U+iU;  
            #local P=<(__Fx(U,V)),(__Fy(U,V)),(__Fz(U,V))>;       //     |      |      |        
            #local Un=U+(iU);                                     //  -- x --- Vn ---- x --
            #local Vn=V+(iV);                                     //     |   /  |   /  |   
            #local Um=U-(iU);                                     //     | /    | /    |   
            #local Vm=V-(iV);                                     //  - Um ---- P ---- Un -
            #if(__TU&Un>=Umax)                                    //     |   /  |   /  |   
               #local Un=U+EPSNorm;                               //     | /    | /    |   
            #end                                                  //  -- x --- Vm ---- x --
            #if(__TV&Vn>=Vmax)                                    //     |      |      |   
               #local Vn=V+EPSNorm;
            #end
            #if(__FU&Um<=Umin)
              #local Um=U-EPSNorm;
            #end
            #if(__FV&Vm<=Vmin)         
               #local Vm=V-EPSNorm;
            #end
            #local N1=<(__Fx(Un,V)),(__Fy(Un,V)),(__Fz(Un,V))>;   // Recalculating these points on each pass
            #local N2=<(__Fx(U,Vn)),(__Fy(U,Vn)),(__Fz(U,Vn))>;   // seems to be faster than storing them in,
            #local N3=<(__Fx(Um,V)),(__Fy(Um,V)),(__Fz(Um,V))>;   // and retreiving them from arrays.
            #local N4=<(__Fx(U,Vm)),(__Fy(U,Vm)),(__Fz(U,Vm))>;
            #local A=(N1-P);
            #local B=(N2-P);      
            #local C=(N3-P);
            #local D=(N4-P);
            #local N1=vcross(A,B);
            #local N2=vcross(B,C);
            #local N3=vcross(C,D);
            #local N4=vcross(D,A);
            #local NormArr[Count]=vnormalize(N4+N1+N2+N3); 
            #local VecArr[Count]=P;
            #local UVArr[Count]=<(U-Umin)/dU,(V-Vmin)/dV>;
            #local Count=Count+1;
            #local J=J+1;            
         #end
         #debug concat("\\r Done ", str(Count,0,0)," vertices : ",str(100*Count/NumVertices,0,2)," %")
         #local I=I+1;
      #end
      BuildWriteMesh2(VecArr, NormArr, UVArr, Iter_U, Iter_V, FileName)
   #end
   #declare __FU=0;   #declare __TU=0;
   #declare __FV=0;   #declare __TV=0;
   #undef __Fx
   #undef __Fy
   #undef __Fz
#end   

// ====================== end of former "param.inc" ====================================

// former "prism.inc" ==================================================================
/*======
Prism(Spl, ResSpl, Height, HRes, FileName): Extrudes the spline along the y-axis.
           The uv_coordinates come from the square <0,0> - <1,1>.

Spl      : The spline to be extruded. 
           The spline is evaluated from t=0 to t=1. For the normal calculation,
           it is required that all splines (also linear_spline) have one extra
           point before t=0 and after t=1.
ResSpl   : The amount of triangles to be used along the spline
Height   : The amount of POV-units to extrude the shape.
HRes     : The amount of triangles to be used in the height.
FileName : The name of the file to which the mesh will be written. If is an
           empty string (""), no file will be written.
           If the file extension is 'obj' a Wavefront objectfile will be written.
           If the extension is 'pcm' a compressed mesh file is written.
           If a file name is given, the macro will first check if it already exists.
           If that is so, it will try to parse the existing file unless it's a '*.obj',
           '*.pcm' or '*.arr' file as POV-Ray can not read them directly. In this case a new
           mesh will be generated, but the existing files will _not_ be over-written.
*/ 
#macro Prism(Spl, ResSpl, Height, HRes, FileName)
   #local __LinSpl=spline {
      linear_spline
      -1,<0,-1,0>
      1e-50, <0,0,0>
      1,<0,Height,0>
      2,<0,Height+1,0>
   }
   Prism1(Spl, ResSpl, __LinSpl, HRes,FileName)
#end

/*======
Prism1(Spl, ResSpl, PSpl, PRes, FileName): Extrudes the spline along the y-axis.
           In every step the spline is scaled by the 'relative' distance from the
           y-axis of the second spline (PSpl).
           The uv_coordinates come from the square <0,0> - <1,1>.

Spl      : The spline to be extruded.
           The spline is evaluated from t=0 to t=1. For the normal calculation,
           it is required that all splines (also linear_spline) have one extra
           point before t=0 and after t=1.
ResSpl   : The amount of triangles to be used along the spline.
PSpl     : The spline that determines by what amount the extrusion is scaled in
           each step. The scaling is based on the relative distance from the y-axis.
           That is, at t=0 the scale is always 1, so that the start of the shape is 
           identical to the spline Spl.
           PSpl also sets the height of the resulting shape (its y-value at t=1).
           The spline is evaluated from t=0 to t=1. For the normal calculation,
           it is required that all splines (also linear_spline) have one extra
           point before t=0 and after t=1.
FileName : The name of the file to which the mesh will be written. If is an empty
           string (""), no file will be written. If a file name is given, the macro
	        will first check if it already exists. If that is so, it will expect a
	        mesh2 with the name "Surface" and try to parse the existing file.
*/

#macro Prism1(Spl, ResSpl, PSpl, PRes, FileName)
   #declare Build=CheckFileName(FileName);
   #if(Build=0)
      #debug concat("\\n Parsing mesh2 from file: ", FileName, "\\n")
      #include FileName
      object{Surface}
   #else
      #local NumVertices=(PRes+1)*(ResSpl+1);
      #local NumFaces=PRes*ResSpl*2;
      #debug concat("\\n Calculating ",str(NumVertices,0,0)," vertices for ", str(NumFaces,0,0)," triangles\\n\\n")
      #local VecArr=array[NumVertices]
      #local NormArr=array[NumVertices]
      #local UVArr=array[NumVertices]
      #local H=PSpl(0);
      #local Scale=pow( pow(H.x,2) + pow(H.z,2), 0.5);
      #local H=H.y;
      #local P=Spl(0);
      #local P=pow( pow(P.x,2) + pow(P.z,2), 0.5);
      #local Corr=(P-Scale);
      #local IStep=1/PRes;
      #local JStep=1/ResSpl;
      #local Count=0;
      #local I=0;
      #while(I<=1)
         #local Scale0=PSpl(I);
         #local H0=<0,Scale0.y-H,0>;
         #local Scale1=PSpl(I+IStep);
         #local H1=<0,Scale1.y-H,0>;
         #local Scale2=PSpl(I-IStep);
         #local H2=<0,Scale2.y-H,0>;
         #local Scale0=RangeMM( pow( pow(Scale0.x,2)+ pow(Scale0.z,2), 0.5)+(Corr), 0,P,0,1);
         #local Scale1=RangeMM( pow( pow(Scale1.x,2)+ pow(Scale1.z,2), 0.5)+(Corr), 0,P,0,1);
         #local Scale2=RangeMM( pow( pow(Scale2.x,2)+ pow(Scale2.z,2), 0.5)+(Corr), 0,P,0,1);
         #local J=0;
         #while (J<=1)
            #local P0=(Spl(J)*Scale0)+H0;
            #local P1=(Spl(J)*Scale1)+H1;
            #local P2=(Spl(J)*Scale2)+H2;
            #local P3=(Spl(J+JStep)*Scale0)+H0;
            #local P4=(Spl(J-JStep)*Scale0)+H0;
            #local B1=P4-P0;
            #local B2=P2-P0;
            #local B3=P3-P0;
            #local B4=P1-P0;
            #local N1=vcross(B1,B2);
            #local N2=vcross(B2,B3);
            #local N3=vcross(B3,B4);
            #local N4=vcross(B4,B1);
            #local Norm=vnormalize((N1+N2+N3+N4));
            #local VecArr[Count]=P0;
            #local NormArr[Count]=Norm;
            #local UVArr[Count]=<J,I>;
            #local J=J+JStep;
            #local Count=Count+1;
         #end
         #debug concat("\\r Done ", str(Count,0,0)," vertices : ", str(100*Count/NumVertices,0,2)," %")
         #local I=I+IStep;
      #end
      BuildWriteMesh2(VecArr, NormArr, UVArr, ResSpl, PRes, FileName)
   #end
#end
// ======================== end of former "prism.inc" =======================================
 
// former: lathe.inc
/*=======
Lathe(Spl, ResSpl, Rot, ResRot, FileName) : The Lathe  macro generates an
           object by rotating a two-dimensional curve about the y-axis. The
           result is a mesh2 object. The uv_coordinates come from the square
           <0,0> - <1,1>.

Spl      : The spline to be rotated.
           The spline is evaluated from t=0 to t=1. For the normal calculation,
           it is required that all splines (also linear_spline) have one extra
           point before t=0 and after t=1.
ResSpl   : The amount of triangles to be used along the spline
Rot      : The angle the spline has to be rotated.
ResRot   : The amount of triangles to be used in the circumference.
FileName : The name of the file to which the mesh will be written. If is an
           empty string (""), no file will be written.
           If the file extension is 'obj' a Wavefront objectfile will be written.
           If the extension is 'pcm' a compressed mesh file is written.
           If a file name is given, the macro will first check if it already exists.
           If that is so, it will try to parse the existing file unless it's a '*.obj',
           '*.pcm' or '*.arr' file as POV-Ray can not read them directly. In this case a new
           mesh will be generated, but the existing files will _not_ be over-written.
*/ 
#macro Lathe(Spl, ResSpl, Rot, ResRot, FileName)
   #declare Build=CheckFileName(FileName);
   #if(Build=0)
      #debug concat("\\n Parsing mesh2 from file: ", FileName, "\\n")
      #include FileName
      object{Surface}
   #else
      #local NumVertices=(ResRot+1)*(ResSpl+1);
      #local NumFaces=ResRot*ResSpl*2;
      #debug concat("\\n Calculating ",str(NumVertices,0,0)," vertices for ",str(NumFaces,0,0)," triangles\\n\\n")
      #local I=0;
      #local VNArr=array[ResSpl+1][2]     //retreive the needed amount of points
      #while (I<=ResSpl)                  //from the spline and calculate the
         #local P0=Spl(I/ResSpl);         //normals to go with these points.
         #if (P0.x=0 & P0.z=0)            //put the result in VNArr.
            #local P0=<1e-25,P0.y,1e-25>;
         #end
         #if (I=0)
            #local P1=Spl(((I-0.5)/ResSpl));
            #local P2=Spl(((I+0.5)/ResSpl));
         #else
            #local P1=P2;
            #local P2=0+Spl(((I+0.5)/ResSpl));
         #end
         #local P3=vrotate(P0,<0,1,0>);
         #local P4=vrotate(P0,<0,-1,0>);
         #local B1=P4-P0;
         #local B2=P2-P0;
         #local B3=P3-P0;
         #local B4=P1-P0;
         #local N1=vcross(B1,B2);
         #local N2=vcross(B2,B3);
         #local N3=vcross(B3,B4);
         #local N4=vcross(B4,B1);
         #local Norm=vnormalize((N1+N2+N3+N4)*-1);
         #local VNArr[I][0]=P0;
         #local VNArr[I][1]=Norm;
         #local I=I+1;
      #end
      #local VecArr=array[NumVertices]
      #local NormArr=array[NumVertices]
      #local UVArr=array[NumVertices]
      #local R=Rot/ResRot;
      #local Dim=dimension_size(VNArr,1);
      #local Count=0;
      #local I=0;
      #while (I<=ResRot)
         #local J=0;
         #while (J<Dim)
            #local VecArr[Count]=vrotate(VNArr[J][0],<0,R*I,0>);
            #local NormArr[Count]=vrotate(VNArr[J][1],<0,R*I,0>);
            #local UVArr[Count]=<I/ResRot,J/(Dim-1)>;
            #local J=J+1;
            #local Count=Count+1;
         #end
         #debug concat("\\r Done ", str(Count,0,0)," vertices : ",str(100*Count/NumVertices,0,2)," %")
         #local I=I+1;
      #end
      BuildWriteMesh2(VecArr, NormArr, UVArr, ResSpl, ResRot, FileName)
   #end
#end

// ========== end of former "lathe.inc" ===============================================
// former "coons.inc" 
/*======
Coons(Spl1, Spl2, Spl3, Spl4, Iter_U, Iter_V, FileName): Generates a "coons
           surface". The surface is defined by four splines, all attached head
           to tail to the previous / next one.
           The uv_coordinates come from the square <0,0> - <1,1>.

Spl1 - 4 : The four spline that define the surface.
           The splines are evaluated from t=0 to t=1.
Iter_U   : The resolution for the splines 1 and 3.
Iter_V   : The resolution for the splines 2 and 4.
FileName : The name of the file to which the mesh will be written. If is an
           empty string (""), no file will be written.
           If the file extension is 'obj' a Wavefront objectfile will be written.
           If the extension is 'pcm' a compressed mesh file is written.
           If a file name is given, the macro will first check if it already exists.
           If that is so, it will try to parse the existing file unless it's a '*.obj',
           '*.pcm' or '*.arr' file as POV-Ray can not read them directly. In this case a new
           mesh will be generated, but the existing files will _not_ be over-written.
*/

#macro Coons(Spl1, Spl2, Spl3, Spl4, Iter_U, Iter_V, FileName)
   #declare Build=CheckFileName(FileName);
   #if(Build=0)
      #debug concat("\\n Parsing mesh2 from file: ", FileName, "\\n")
      #include FileName
      object{Surface}
   #else
      #local NumVertices=(Iter_U+1)*(Iter_V+1);
      #local NumFaces=Iter_U*Iter_V*2;
      #debug concat("\\n Calculating ", str(NumVertices,0,0), " vertices for ",str(NumFaces,0,0), " triangles\\n\\n")
      #declare VecArr=array[NumVertices]   
      #declare NormArr=array[NumVertices]   
      #local UVArr=array[NumVertices]      
      #local Spl1_0=Spl1(0);
      #local Spl2_0=Spl2(0);
      #local Spl3_0=Spl3(0);
      #local Spl4_0=Spl4(0);
      #local UStep=1/Iter_U;
      #local VStep=1/Iter_V;
      #local Count=0;
      #local I=0;
      #while (I<=1)
         #local Im=1-I;
         #local J=0;
         #while (J<=1)
            #local Jm=1-J;
            #local C0=Im*Jm*(Spl1_0)+Im*J*(Spl2_0)+I*J*(Spl3_0)+I*Jm*(Spl4_0);
            #local P0=LInterpolate(I, Spl1(J), Spl3(Jm)) + 
               LInterpolate(Jm, Spl2(I), Spl4(Im))-C0;
            #declare VecArr[Count]=P0;
            #local UVArr[Count]=<J,I>;
            #local J=J+UStep;
            #local Count=Count+1;
         #end
         #debug concat(
            "\\r Done ", str(Count,0,0)," vertices :         ",
            str(100*Count/NumVertices,0,2)," %"
         )
         #local I=I+VStep;
      #end
      #debug "\\r Normals                                  "
      #local Count=0;
      #local I=0;
      #while (I<=Iter_V)
         #local J=0;
         #while (J<=Iter_U)
            #local Ind=(I*Iter_U)+I+J;
            #local P0=VecArr[Ind];
            #if(J=0)
               #local P1=P0+(P0-VecArr[Ind+1]);
            #else
               #local P1=VecArr[Ind-1];
            #end
            #if (J=Iter_U)
               #local P2=P0+(P0-VecArr[Ind-1]);
            #else
               #local P2=VecArr[Ind+1];
            #end
            #if (I=0)
               #local P3=P0+(P0-VecArr[Ind+Iter_U+1]);
            #else
               #local P3=VecArr[Ind-Iter_U-1];                       
            #end
            #if (I=Iter_V)
               #local P4=P0+(P0-VecArr[Ind-Iter_U-1]);
            #else
               #local P4=VecArr[Ind+Iter_U+1];
            #end
            #local B1=P4-P0;
            #local B2=P2-P0;
            #local B3=P3-P0;
            #local B4=P1-P0;
            #local N1=vcross(B1,B2);
            #local N2=vcross(B2,B3);
            #local N3=vcross(B3,B4);
            #local N4=vcross(B4,B1);
            #local Norm=vnormalize((N1+N2+N3+N4));      
            #declare NormArr[Count]=Norm;
            #local J=J+1;
            #local Count=Count+1;
         #end
         #debug concat("\\r Done ", str(Count,0,0)," normals : ",str(100*Count/NumVertices,0,2), " %")
         #local I=I+1;
      #end
      BuildWriteMesh2(VecArr, NormArr, UVArr, Iter_U, Iter_V, FileName)
   #end
#end
// ========================= end of former "coons.inc" =============================

// former "twovar.inc"

#macro TwoVarSurf(__Fuv, Urange, Vrange, Iter_U, Iter_V, FileName)
   #declare Build=CheckFileName(FileName);
   #if(Build=0)
      #debug concat("\\n Parsing mesh2 from file: ", FileName, "\\n")
      #include FileName
      object{Surface}
   #else
      #local Umin=Urange.u;
      #local Umax=Urange.v;
      #local Vmin=Vrange.u;
      #local Vmax=Vrange.v;
      #local dU=Umax-Umin;
      #local dV=Vmax-Vmin;
      #local iU=dU/Iter_U;
      #local iV=dV/Iter_V;
      #local NumVertices=(Iter_U+1)*(Iter_V+1);
      #declare NumFaces=Iter_U*Iter_V*2;
      #debug concat("\\n Calculating ",str(NumVertices,0,0)," vertices for ", str(NumFaces,0,0)," triangles\\n\\n")
      #local VecArr=array[NumVertices] 
      #local NormArr=array[NumVertices] 
      #local UVArr=array[NumVertices]
      #local Count=0;   
      #local I=0;  
      #while (I<Iter_V+1)
         #local V=RangeMM(I,0,Iter_V,Vmin,Vmax);
         #local J=0;
         #while (J<Iter_U+1)
            #local U=RangeMM(J,0,Iter_U,Umin,Umax);
            #if(J=0)
               #local P0=<U,V,__Fuv(U,V)>;
               #local P2=<U-iU,V,__Fuv(U-iU,V)>;
            #else
               #local P0=P1;
               #local P2=P0;
            #end
            #local P1=<U+iU,V,__Fuv(U+iU,V)>;
            #local P3=<U,V+iV,__Fuv(U,V+iV)>;
            #local P4=<U,V-iV,__Fuv(U,V-iV)>;
            #local B1=P4-P0;
            #local B2=P2-P0;
            #local B3=P3-P0;
            #local B4=P1-P0;
            #local N1=vcross(B1,B2);
            #local N2=vcross(B2,B3);
            #local N3=vcross(B3,B4);
            #local N4=vcross(B4,B1);
            #local Norm=vnormalize((N1+N2+N3+N4));
            #local VecArr[Count]=P0;  
            #local NormArr[Count]=Norm;  
            #local UVArr[Count]=<(U-Umin)/dU,(V-Vmin)/dV>;
            #local Count=Count+1;
            #local J=J+1;            
         #end
         #debug concat("\\r Done ", str(Count,0,0)," vertices : ",str(100*Count/NumVertices,0,2)," %")
         #local I=I+1;
      #end
      BuildWriteMesh2(VecArr, NormArr, UVArr, Iter_U, Iter_V, FileName)
   #end
#end

// =============== end of former "twovar.inc"



// Persistence of Vision Ray Tracer Include File
// File: SweepSpline.inc
// For POV Version: 3.5
// Desc: Macro sweeping one spline along another
// SweepSpline Version: 3
// Date: 1-Mar-2004
// Auth: Mike Williams
// Based on an idea by Greg M. Johnson
// Requires makemesh.inc by Ingo Janssen 
//
// Parameters
// Track        A spline that specifies the path along the object
//              The section of the spline between control points 0 and 1 will be used
// Shape        A spline that describes the cross section 
//              The section of the spline between control points 0 and 1 will be used
// Waist        A spline with x coordinates that specify the radius of the spheresweep
//              The section of the spline between control points 0 and 1 will be used
// U            The number of vertices along the path
// V            The number of vertices around the circumpherence
// FileName     The name of the file to which the mesh will be written. If is an
//              empty string (""), no file will be written. If a file name is given,
//              the macro will first check if it already exists. If that is so, it
//              will expect a mesh2 with the name "Surface" and try to parse the
//              existing file.
//#include "meshmaker.inc" //former: #include "makemesh.inc"

#macro FindPoint(su,sv)

     // Spline point and radius 
     #local P = Track(su);
     #local W = vlength(Waist(su).x);

     // Vertex position
     // To prevent flipping, calculate from the previous DRY vector 
     #local DRX = W*vnormalize(vcross(DR,DRY));
     #local DRY = W*vnormalize(vcross(DRX,DR));
     P + (Shape(sv).x)*DRX + (Shape(sv).y)*DRY;

#end


#macro SweepSpline1(Track,Shape,Waist,U,V,Filename)
#if(strlen(Filename)>0)
  #if(file_exists(Filename))
    #debug concat("\\n Parsing mesh2 from file: ", Filename, "\\n")
    #local Build=0;
    #include Filename
     object{Surface}
  #else
    #local Build=1;
  #end
#else
  #local Build=1;
#end

#if (Build)
#local Verts = array[U*(V+1)]
#local Norms = array[U*(V+1)]
#local UV    = array[U*(V+1)]
                           
// Calculate the Vertexes, Normals and UV arrays
#local DRY = y; // Arbitrary initial vector that X will be perpendicular to
#local uu=0;
#while (uu<U)
  #local vv=0;
  #while (vv<=V)
     // UV information
     #local su = uu/U;
     #local sv = vv/V;
     #local UV[uu*(V+1)+vv] = <su,sv>;

     // Direction the spline is pointing
     #local DR = Track(su+0.001)-Track(su-0.001); 
     
     // Find some points
     #local P = FindPoint(su,sv);
     #local Verts[uu*(V+1)+vv] = P;
     
     #local Pu0=P; 
     #local Pu1 = FindPoint(su+0.001,sv);
     #if (vlength(Pu1-Pu0)=0)
       #local Pu1 = Pu0;
       #local Pu0 = FindPoint(su-0.001,sv);
     #end
     
     #local Pv0=P; 
     #local Pv1 = FindPoint(su,sv+0.001);
     #if (vlength(Pv1-Pv0)=0)
       #local Pv1 = Pv0;
       #local Pv0 = FindPoint(su,sv-0.001);
     #end
                        
     // calculate the normal                        
     #local Norms[uu*(V+1)+vv] = vcross(Pu1-Pu0,Pv1-Pv0);

     #local vv=vv+1;
  #end
  #local uu=uu+1;
#end

  BuildWriteMesh2(Verts, Norms, UV, V, U-1, Filename)

#end
#end // ----------------------------------------------------- end SweepSpline1()


#macro SweepSpline2(Track,Shape,Waist,U,V,Filename)
#if(strlen(Filename)>0)
  #if(file_exists(Filename))
    #debug concat("\\n Parsing mesh2 from file: ", Filename, "\\n")
    #local Build=0;
    #include Filename
     object{Surface}
  #else
    #local Build=1;
  #end
#else
  #local Build=1;
#end

#if (Build)#local Verts = array[U*(V+1)]
#local Norms = array[U*(V+1)]
#local UV    = array[U*(V+1)]
                           
// Calculate the Vertexes, Normals and UV arrays
#local DRY = y; // Arbitrary initial vector that X will be perpendicular to
#local uu=0;
#while (uu<U)
  #local vv=0;
  #while (vv<=V)
     // UV information
     #local su = uu/U;
     #local sv = vv/V;
     #local UV[uu*(V+1)+vv] = <su,sv>;
     
     // Spline point and radius 
     #local P = Track(su);
     #local W = vlength(Waist(su).x);

     // Direction the spline is pointing
     #local DR = Track(su+0.001)-Track(su-0.001); 

     // Vertex position
     // To prevent flipping, calculate from the previous DRY vector 
     #local DRX = W*vnormalize(vcross(DR,DRY));
     #local DRY = W*vnormalize(vcross(DRX,DR));
     #local Verts[uu*(V+1)+vv] = P + (Shape(sv).x)*DRX + (Shape(sv).y)*DRY;

     // Normal
     #local NP1 = (Shape(sv).x)*DRX + (Shape(sv).y)*DRY; 
     #local NP2 = (Shape(sv+0.001).x)*DRX + (Shape(sv+0.001).y)*DRY;
     #local DS = NP2-NP1;
     #if (vlength(DS) = 0) // can happen at end point of Shape
       #local NP1 = (Shape(sv-0.001).x)*DRX + (Shape(sv-0.001).y)*DRY; 
       #local NP2 = (Shape(sv+0.001).x)*DRX + (Shape(sv+0.001).y)*DRY;
       #local DS = NP2-NP1;
     #end     

     #local Norms[uu*(V+1)+vv] = vcross(DR,DS);

     #local vv=vv+1;
  #end
  #local uu=uu+1;
#end

BuildWriteMesh2(Verts, Norms, UV, V, U-1, Filename)

#end
#end// ----------------------------------------------------- end SweepSpline2()


// ------------------------------------------------------
#version makemesh_Inc_Temp; 
#end //ifndef
`,
    'metals.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

#ifndef(Metals_Inc_Temp)
#declare Metals_Inc_Temp=version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
#   debug "including metals.inc\\n"
#end

/*
              Persistence of Vision Raytracer Version 3.1
               Metallic pigments, finishes, and textures.


*****************************************************************************
                           BASIC METAL COLORS
*****************************************************************************
 Note: Describing metallic textures is difficult, at best.  The reflectivity
 and other qualities make them highly dependant on lighting and surroundings.

 The following notes are intended as a rough guide only.
 P_Brass1: Dark brown bronze.
 P_Brass2: Somewhat lighter brown than Brass4. Old penny, in soft finishes.
 P_Brass3: Used by Steve Anger's Polished_Brass. Slightly coppery.
 P_Brass4: A little yellower than Brass1.
 P_Brass5: Very light bronze, ranges from med tan to almost white.

 P_Copper1: bronze-like.  Best in finish #C.
 P_Copper2: slightly brownish copper/bronze.  Best in finishes #B-#D.
 P_Copper3: reddish-brown copper.  Best in finishes #C-#E.
 P_Copper4: pink copper, like new tubing.  Best in finishes #C-#E.
 P_Copper5: Bronze in softer finishes, gold in harder finishes.

 P_Chrome1: 20% Gray. Used in Steve Anger's Polished_Chrome.
 P_Chrome2: Slightly blueish 60% gray. Good steel w/finish #A
 P_Chrome3: 50% neutral gray.
 P_Chrome4: 75% neutral gray.
 P_Chrome5: 95% neutral gray.

 P_Silver1: Yellowish silverplate.  Somewhat tarnished looking.
 P_Silver2: Not quite as yellowish as Silver1 but more so than Silver3.
 P_Silver3: Reasonably neutral silver.
 P_Silver4: REDUNDANT (unused)
 P_Silver5: REDUNDANT (unused)

*/

#include "golds.inc"

#declare P_Brass1    = color rgb <0.30, 0.20, 0.10>;
#declare P_Brass2    = color rgb <0.50, 0.35, 0.25>;
#declare P_Brass3    = color rgb <0.58, 0.42, 0.20>;
#declare P_Brass4    = color rgb <0.65, 0.50, 0.25>;
#declare P_Brass5    = color rgb <0.70, 0.55, 0.40>;

#declare P_Copper1   = color rgb <0.40, 0.20, 0.15>;
#declare P_Copper2   = color rgb <0.50, 0.25, 0.15>;
#declare P_Copper3   = color rgb <0.60, 0.30, 0.15>;
#declare P_Copper4   = color rgb <0.70, 0.25, 0.15>;
#declare P_Copper5   = color rgb <0.65, 0.35, 0.15>;

#declare P_Chrome1   = color rgb <0.20, 0.20, 0.20>;
#declare P_Chrome2   = color rgb <0.39, 0.41, 0.43>;
#declare P_Chrome3   = color rgb <0.50, 0.50, 0.50>;
#declare P_Chrome4   = color rgb <0.75, 0.75, 0.75>;
#declare P_Chrome5   = color rgb <0.95, 0.95, 0.95>;

#declare P_Silver1   = color rgb <0.94, 0.93, 0.80>;
#declare P_Silver2   = color rgb <0.94, 0.93, 0.85>;
#declare P_Silver3   = color rgb <0.94, 0.93, 0.90>;
#declare P_Silver4   = color rgb <0.95, 0.91, 0.91>;             
#declare P_Silver5   = color rgb <0.91, 0.95, 0.91>;   

//*****************************************************************************
//                           BASIC METAL FINISHES
//*****************************************************************************

// F_MetalA  :  Very soft and dull.  
// F_MetalB  :  Fairly soft and dull.
// F_MetalC  :  Medium reflectivity. Holds color well.
// F_MetalD  :  Highly hard and polished. High reflectivity.   
// F_MetalE  :  Very highly polished & reflective.

#declare F_MetalA  =
finish {
    ambient 0.35
    brilliance 2
    diffuse 0.3
    metallic
    specular 0.80
    roughness 1/20
    reflection 0.1
}

#declare F_MetalB  = 
finish {
    ambient 0.30
    brilliance 3
    diffuse 0.4
    metallic
    specular 0.70
    roughness 1/60
    reflection 0.25
}

#declare F_MetalC  =
finish {
    ambient 0.25
    brilliance 4
    diffuse 0.5
    metallic
    specular 0.80
    roughness 1/80
    reflection 0.5
}

#declare F_MetalD  =
finish {
    ambient 0.15
    brilliance 5
    diffuse 0.6
    metallic
    specular 0.80
    roughness 1/100
    reflection 0.65
}

#declare F_MetalE  =
finish {
    ambient 0.1
    brilliance 6
    diffuse 0.7
    metallic
    specular 0.80
    roughness 1/120
    reflection 0.8
}

//*****************************************************************************
//                           METAL TEXTURES
//*****************************************************************************

//                              BRASSES
#declare T_Brass_1A = texture { pigment { P_Brass1 } finish { F_MetalA  } }
#declare T_Brass_1B = texture { pigment { P_Brass1 } finish { F_MetalB  } }
#declare T_Brass_1C = texture { pigment { P_Brass1 } finish { F_MetalC  } }
#declare T_Brass_1D = texture { pigment { P_Brass1 } finish { F_MetalD  } }
#declare T_Brass_1E = texture { pigment { P_Brass1 } finish { F_MetalE  } }

#declare T_Brass_2A = texture { pigment { P_Brass2 } finish { F_MetalA  } }
#declare T_Brass_2B = texture { pigment { P_Brass2 } finish { F_MetalB  } }
#declare T_Brass_2C = texture { pigment { P_Brass2 } finish { F_MetalC  } }
#declare T_Brass_2D = texture { pigment { P_Brass2 } finish { F_MetalD  } }
#declare T_Brass_2E = texture { pigment { P_Brass2 } finish { F_MetalE  } }

#declare T_Brass_3A = texture { pigment { P_Brass3 } finish { F_MetalA  } }
#declare T_Brass_3B = texture { pigment { P_Brass3 } finish { F_MetalB  } }
#declare T_Brass_3C = texture { pigment { P_Brass3 } finish { F_MetalC  } }
#declare T_Brass_3D = texture { pigment { P_Brass3 } finish { F_MetalD  } }
#declare T_Brass_3E = texture { pigment { P_Brass3 } finish { F_MetalE  } }

#declare T_Brass_4A = texture { pigment { P_Brass4 } finish { F_MetalA  } }
#declare T_Brass_4B = texture { pigment { P_Brass4 } finish { F_MetalB  } }
#declare T_Brass_4C = texture { pigment { P_Brass4 } finish { F_MetalC  } }
#declare T_Brass_4D = texture { pigment { P_Brass4 } finish { F_MetalD  } }
#declare T_Brass_4E = texture { pigment { P_Brass4 } finish { F_MetalE  } }

#declare T_Brass_5A = texture { pigment { P_Brass5 } finish { F_MetalA  } }
#declare T_Brass_5B = texture { pigment { P_Brass5 } finish { F_MetalB  } }
#declare T_Brass_5C = texture { pigment { P_Brass5 } finish { F_MetalC  } }
#declare T_Brass_5D = texture { pigment { P_Brass5 } finish { F_MetalD  } }
#declare T_Brass_5E = texture { pigment { P_Brass5 } finish { F_MetalE  } }

//                           COPPERS & BRONZES
#declare T_Copper_1A = texture { pigment { P_Copper1 } finish { F_MetalA  } }
#declare T_Copper_1B = texture { pigment { P_Copper1 } finish { F_MetalB  } }
#declare T_Copper_1C = texture { pigment { P_Copper1 } finish { F_MetalC  } }
#declare T_Copper_1D = texture { pigment { P_Copper1 } finish { F_MetalD  } }
#declare T_Copper_1E = texture { pigment { P_Copper1 } finish { F_MetalE  } }
                                           
#declare T_Copper_2A = texture { pigment { P_Copper2 } finish { F_MetalA  } }
#declare T_Copper_2B = texture { pigment { P_Copper2 } finish { F_MetalB  } }
#declare T_Copper_2C = texture { pigment { P_Copper2 } finish { F_MetalC  } }
#declare T_Copper_2D = texture { pigment { P_Copper2 } finish { F_MetalD  } }
#declare T_Copper_2E = texture { pigment { P_Copper2 } finish { F_MetalE  } }
                                           
#declare T_Copper_3A = texture { pigment { P_Copper3 } finish { F_MetalA  } }
#declare T_Copper_3B = texture { pigment { P_Copper3 } finish { F_MetalB  } }
#declare T_Copper_3C = texture { pigment { P_Copper3 } finish { F_MetalC  } }
#declare T_Copper_3D = texture { pigment { P_Copper3 } finish { F_MetalD  } }
#declare T_Copper_3E = texture { pigment { P_Copper3 } finish { F_MetalE  } }
                                           
#declare T_Copper_4A = texture { pigment { P_Copper4 } finish { F_MetalA  } }
#declare T_Copper_4B = texture { pigment { P_Copper4 } finish { F_MetalB  } }
#declare T_Copper_4C = texture { pigment { P_Copper4 } finish { F_MetalC  } }
#declare T_Copper_4D = texture { pigment { P_Copper4 } finish { F_MetalD  } }
#declare T_Copper_4E = texture { pigment { P_Copper4 } finish { F_MetalE  } }
                                           
#declare T_Copper_5A = texture { pigment { P_Copper5 } finish { F_MetalA  } }
#declare T_Copper_5B = texture { pigment { P_Copper5 } finish { F_MetalB  } }
#declare T_Copper_5C = texture { pigment { P_Copper5 } finish { F_MetalC  } }
#declare T_Copper_5D = texture { pigment { P_Copper5 } finish { F_MetalD  } }
#declare T_Copper_5E = texture { pigment { P_Copper5 } finish { F_MetalE  } }

//                           CHROMES & STEELS  
#declare T_Chrome_1A = texture { pigment { P_Chrome1 } finish { F_MetalA  } }
#declare T_Chrome_1B = texture { pigment { P_Chrome1 } finish { F_MetalB  } }
#declare T_Chrome_1C = texture { pigment { P_Chrome1 } finish { F_MetalC  } }
#declare T_Chrome_1D = texture { pigment { P_Chrome1 } finish { F_MetalD  } }
#declare T_Chrome_1E = texture { pigment { P_Chrome1 } finish { F_MetalE  } }
                                           
#declare T_Chrome_2A = texture { pigment { P_Chrome2 } finish { F_MetalA  } }
#declare T_Chrome_2B = texture { pigment { P_Chrome2 } finish { F_MetalB  } }
#declare T_Chrome_2C = texture { pigment { P_Chrome2 } finish { F_MetalC  } }
#declare T_Chrome_2D = texture { pigment { P_Chrome2 } finish { F_MetalD  } }
#declare T_Chrome_2E = texture { pigment { P_Chrome2 } finish { F_MetalE  } }
                                           
#declare T_Chrome_3A = texture { pigment { P_Chrome3 } finish { F_MetalA  } }
#declare T_Chrome_3B = texture { pigment { P_Chrome3 } finish { F_MetalB  } }
#declare T_Chrome_3C = texture { pigment { P_Chrome3 } finish { F_MetalC  } }
#declare T_Chrome_3D = texture { pigment { P_Chrome3 } finish { F_MetalD  } }
#declare T_Chrome_3E = texture { pigment { P_Chrome3 } finish { F_MetalE  } }
                                           
#declare T_Chrome_4A = texture { pigment { P_Chrome4 } finish { F_MetalA  } }
#declare T_Chrome_4B = texture { pigment { P_Chrome4 } finish { F_MetalB  } }
#declare T_Chrome_4C = texture { pigment { P_Chrome4 } finish { F_MetalC  } }
#declare T_Chrome_4D = texture { pigment { P_Chrome4 } finish { F_MetalD  } }
#declare T_Chrome_4E = texture { pigment { P_Chrome4 } finish { F_MetalE  } }
                                           
#declare T_Chrome_5A = texture { pigment { P_Chrome5 } finish { F_MetalA  } }
#declare T_Chrome_5B = texture { pigment { P_Chrome5 } finish { F_MetalB  } }
#declare T_Chrome_5C = texture { pigment { P_Chrome5 } finish { F_MetalC  } }
#declare T_Chrome_5D = texture { pigment { P_Chrome5 } finish { F_MetalD  } }
#declare T_Chrome_5E = texture { pigment { P_Chrome5 } finish { F_MetalE  } }

//                               SILVERS        
#declare T_Silver_1A = texture { pigment { P_Silver1 } finish { F_MetalA  } }
#declare T_Silver_1B = texture { pigment { P_Silver1 } finish { F_MetalB  } }
#declare T_Silver_1C = texture { pigment { P_Silver1 } finish { F_MetalC  } }
#declare T_Silver_1D = texture { pigment { P_Silver1 } finish { F_MetalD  } }
#declare T_Silver_1E = texture { pigment { P_Silver1 } finish { F_MetalE  } }
                                           
#declare T_Silver_2A = texture { pigment { P_Silver2 } finish { F_MetalA  } }
#declare T_Silver_2B = texture { pigment { P_Silver2 } finish { F_MetalB  } }
#declare T_Silver_2C = texture { pigment { P_Silver2 } finish { F_MetalC  } }
#declare T_Silver_2D = texture { pigment { P_Silver2 } finish { F_MetalD  } }
#declare T_Silver_2E = texture { pigment { P_Silver2 } finish { F_MetalE  } }
                                           
#declare T_Silver_3A = texture { pigment { P_Silver3 } finish { F_MetalA  } }
#declare T_Silver_3B = texture { pigment { P_Silver3 } finish { F_MetalB  } }
#declare T_Silver_3C = texture { pigment { P_Silver3 } finish { F_MetalC  } }
#declare T_Silver_3D = texture { pigment { P_Silver3 } finish { F_MetalD  } }
#declare T_Silver_3E = texture { pigment { P_Silver3 } finish { F_MetalE  } }
                                           
#declare T_Silver_4A = texture { pigment { P_Silver4 } finish { F_MetalA  } }
#declare T_Silver_4B = texture { pigment { P_Silver4 } finish { F_MetalB  } }
#declare T_Silver_4C = texture { pigment { P_Silver4 } finish { F_MetalC  } }
#declare T_Silver_4D = texture { pigment { P_Silver4 } finish { F_MetalD  } }
#declare T_Silver_4E = texture { pigment { P_Silver4 } finish { F_MetalE  } }
                                           
#declare T_Silver_5A = texture { pigment { P_Silver5 } finish { F_MetalA  } }
#declare T_Silver_5B = texture { pigment { P_Silver5 } finish { F_MetalB  } }
#declare T_Silver_5C = texture { pigment { P_Silver5 } finish { F_MetalC  } }
#declare T_Silver_5D = texture { pigment { P_Silver5 } finish { F_MetalD  } }
#declare T_Silver_5E = texture { pigment { P_Silver5 } finish { F_MetalE  } }


#version Metals_Inc_Temp;
#end
`,
    'rad_def.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: rad_def.inc
//    Last updated: 2010.5.24
//    Description: Set some common radiosity settings.

// These settings are extremely general and are intended for
// ease of use, and don't necessarily give the best results.

// Modified 2001.7.26: Made Normal and Media parameters work
// no matter what setting is used. (Chris Huff)

#ifndef(Rad_Def2_Inc_Temp)
#declare Rad_Def2_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
    #debug "including rad_def.inc\\n"
#end

#declare Radiosity_Default = 0;
#declare Radiosity_Debug = 1;
#declare Radiosity_Fast = 2;
#declare Radiosity_Normal = 3;
#declare Radiosity_2Bounce = 4;
#declare Radiosity_Final = 5;

#declare Radiosity_OutdoorLQ = 6;
#declare Radiosity_OutdoorHQ = 7;
#declare Radiosity_OutdoorLight = 8;
#declare Radiosity_IndoorLQ = 9;
#declare Radiosity_IndoorHQ = 10;


// The correct format for using this file is:
//
// #include "rad_def.inc"
// global_settings {
//   radiosity {
//     Rad_Settings(Radiosity_Default, off, off)
//   }
// }
//
//
// for first parameter use one of the above constants
//
// second parameter for radiosity normal switch
// (turn 'on' if normal should be taken into account when calculating radiosity)
//
// third parameter for radiosity media switch
// (turn 'on' if media should be taken into account when calculating radiosity)
//


#macro Rad_Settings(Nbr, Normal, Media)

  #switch(Nbr)

    // An empty radiosity block using default settings
    #case (Radiosity_Default)
    #debug "\\nRadiosity_Default in use\\n"
    #break

    // Run it fast, don't try to make it look good, make sure that
    // you can actually see where the radiosity boundaries are.
    #case (Radiosity_Debug)
      pretrace_start 0.08
      pretrace_end   0.02
      count 10
      nearest_count 1
      error_bound 0.3
      recursion_limit 1
      low_error_factor 0.8
      gray_threshold 0
      minimum_reuse 0.015
      brightness 1.0
      adc_bailout 0.01/2
    #debug "\\nRadiosity_Debug in use\\n"
    #break

    // Make it look as good as you can, but I'm in a hurry
    #case (Radiosity_Fast)
      pretrace_start 0.08
      pretrace_end   0.02
      count 80
      nearest_count 5
      error_bound 0.4
      recursion_limit 1
      low_error_factor 0.9
      gray_threshold 0
      minimum_reuse 0.025
      brightness 1.0
      adc_bailout 0.01/2
    #debug "\\nRadiosity_Fast in use\\n"
    #break

    // Typical values
    #case (Radiosity_Normal)
      pretrace_start 0.08
      pretrace_end   0.01
      count 200
      nearest_count 7
      error_bound 0.3
      recursion_limit 1
      low_error_factor 0.75
      gray_threshold 0
      minimum_reuse 0.017
      brightness 1.0
      adc_bailout 0.01/2
    #debug "\\nRadiosity_Normal in use\\n"
    #break

    // Typical values, but with 2 bounces.  Starts slow, but picks up steam!
    #case (Radiosity_2Bounce)
      pretrace_start 0.08
      pretrace_end   0.01
      count 200
      nearest_count 7
      error_bound 0.3
      recursion_limit 2
      low_error_factor 0.75
      gray_threshold 0
      minimum_reuse 0.017
      brightness 1.0
      adc_bailout 0.01/2
    #debug "\\nRadiosity_2Bounce in use\\n"
    #break

    // For patient quality freaks with fast computers about to leave on vacation
    #case (Radiosity_Final)
      pretrace_start 0.08
      pretrace_end   0.004
      count 800
      nearest_count 9
      error_bound 0.2
      recursion_limit 1
      low_error_factor 0.7
      gray_threshold 0
      minimum_reuse 0.01
      brightness 1.0
      adc_bailout 0.01/2
    #debug "\\nRadiosity_Final in use\\n"
    #break

    // For outdoor scenes without light sources
    // Low quality being reasonably fast in most scenes
    #case (Radiosity_OutdoorLQ)
      pretrace_start 0.08
      pretrace_end   0.01
      count 80
      nearest_count 4
      error_bound 0.6
      recursion_limit 1      // increase this in scenes with complicated geometries when necessary
      low_error_factor 0.8
      gray_threshold 0
      minimum_reuse 0.015
      brightness 1.0
      adc_bailout 0.01/2
    #debug "\\nRadiosity_OutdoorLQ in use\\n"
    #break

    // For outdoor scenes without light sources
    // High quality - can be very slow
    #case (Radiosity_OutdoorHQ)
      pretrace_start 0.08
      pretrace_end   0.004
      count 500
      nearest_count 7
      error_bound 0.1
      recursion_limit 1      // increase this in scenes with complicated geometries when necessary
      low_error_factor 0.5
      gray_threshold 0
      minimum_reuse 0.015
      brightness 1.0
      adc_bailout 0.01/2
    #debug "\\nRadiosity_OutdoorHQ in use\\n"
    #break

    // Settings for outdoor scenes with (Sun)light
    // for getting a general skylight effect
    #case (Radiosity_OutdoorLight)
      pretrace_start 0.08
      pretrace_end   0.01
      count 50
      nearest_count 4
      error_bound 0.8
      recursion_limit 1
      low_error_factor 0.9
      gray_threshold 0
      minimum_reuse 0.015
      brightness 1.0
      adc_bailout 0.01/2
    #debug "\\nRadiosity_OutdoorLight in use\\n"
    #break

    // quite fast settings for indoor radiosity
    // good values much depend on actual situation
    // these settings can be taken as a basis
    #case (Radiosity_IndoorLQ)
      pretrace_start 0.08
      pretrace_end   0.01
      count 80
      nearest_count 5
      error_bound 0.7
      recursion_limit 2
      low_error_factor 0.8
      gray_threshold 0
      minimum_reuse 0.015
      brightness 1.0
      adc_bailout 0.01/2
    #debug "\\nRadiosity_IndoorLQ in use\\n"
    #break

    // slower settings for indoor radiosity
    // good values much depend on actual situation
    // these settings can be taken as a basis
    #case (Radiosity_IndoorHQ)
      pretrace_start 0.08
      pretrace_end   0.004
      count 400
      nearest_count 8
      error_bound 0.15
      recursion_limit 3
      low_error_factor 0.5
      gray_threshold 0
      minimum_reuse 0.015
      brightness 1.0
      adc_bailout 0.01/2
    #debug "\\nRadiosity_IndoorHQ in use\\n"
    #break
  #end

    normal Normal
    media Media
#end

#version Rad_Def2_Inc_Temp;
#end
`,
    'rand.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: rand.inc
//    Last updated: 2001.8.9
//    Description: some predefined random number generators, and
//    macros for working with random numbers.
//    Random number distribution macros contributed by Ingo Janssen.

#ifndef(RAND_INC_TEMP)
#declare RAND_INC_TEMP = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
   #debug "including rand.inc\\n"
#end

#include "consts.inc"

//--------------------
//Random number generators:
//--------------------
#declare RdmA = seed(574647);// Random stream A
#declare RdmB = seed(324879);// Random stream B
#declare RdmC = seed(296735);// Random stream C
#declare RdmD = seed(978452);// Random stream D

//--------------------
//Random number macros:
//--------------------

//Probability, returns true or false.
//P is probability of returning true, RS is a random number stream.
#macro Prob(P, RS) (rand(RS) < P) #end


/////////////////////////////////////////
// Continuous Symmetric Distributions //
////////////////////////////////////////
#declare Gauss_Next = false;

// Cauchy distribution
// Input:  Mu=mean, Sigma= standard deviation and a random stream
#macro Rand_Cauchy(Mu, Sigma, Stream)
   (Sigma*tan(pi*(rand(Stream)-0.5))+Mu)
#end

// Student's-t distribution
// Input: N= degrees of freedom and a random stream.
#macro Rand_Student(N, Stream)
   (Rand_Gauss(0,1,Stream)/sqrt(Rand_Chi_Square(N,Stream)/N))
#end

// Normal distribution
// Input:  Mu=mean, Sigma= standard deviation and a random stream
// Output: a random value in the range of the normal distribution
//         defined by the standard deviation, around the mean.
#macro Rand_Normal(Mu, Sigma, Stream)
   #local Cn=4*exp(-0.5)/sqrt(2);
   #local Loop=true;
   #while (Loop)
      #local R=rand(Stream);
      #local V=Cn*(rand(Stream)-0.5)/R;
      #local VV=V*V/4;
      #if (VV<=-ln(R))
         #local Loop=false;
      #end
   #end
   (Mu+(V*Sigma))
#end

// Gaussian distribution
// like Rand_Normal, but a bit faster
#macro Rand_Gauss(Mu, Sigma, Stream)
   #local Zgauss=Gauss_Next;
   #declare Gauss_Next=false;
   #if (!Zgauss)
      #local R1=rand(Stream)*2*pi;
      #local R2=sqrt(-2*ln(1-rand(Stream)));
      #local Zgauss=cos(R1)*R2;
      #declare Gauss_Next=sin(R1)*R2;
   #end
   (Mu+(Zgauss*Sigma))
#end


/////////////////////////////////////
// Continuous Skewed Distributions //
/////////////////////////////////////

// Input:  spline and a random stream.
// Output: a random value in the range 0 - 1.
// The probability of the value is controled
// by the spline. The splines clock_value is
// the output value and the .y value its chanche.
#macro Rand_Spline(Spl, Stream)
   #local I=1;
   #while (I)
      #declare cVal=rand(Stream);
      #if (Spl(cVal).y>=rand(Stream))
         #local I=0;
         (cVal)
      #end
   #end
#end

// Gamma distribution
// Input: Alpha= shape parameter >0, Beta= scale parameter >0 and a random stream.
#macro Rand_Gamma(Alpha, Beta, Stream)
   #if(Alpha<=0 | Beta<=0)
       #error "Alpha and Beta should be bigger than 0"
   #end
   #local Ainv=sqrt(2*Alpha-1);
   #local BBB=Alpha-ln(4);
   #local CCC=Alpha+Ainv;
   #if (Alpha>1)
      #local Loop = true;
      #while (Loop)
         #local R1=rand(Stream);
         #local R2=rand(Stream);
         #local V=ln(R1/(1-R1))/Ainv;
         #local X=Alpha*exp(V);
         #local Z=R1*R1*R2;
         #local R=BBB+CCC*V-X;
         #local RZ=R+(1+ln(4.5))-4.5*Z;
         #if (RZ>=0 | R>=ln(Z))
            #local Loop=false;
            #local RETURN=X;
         #end
      #end
   #end
   #if (Alpha=1)
      #local R=rand(Stream);
      #while (R<=1e-7)
         #local R=rand(Stream);
      #end
      #local RETURN=-ln(R);
   #end
   #if (Alpha>0 & Alpha<1)
      #local Loop=true;
      #while (Loop)
         #local R=rand(Stream);
         #local B=(e+Alpha)/e;
         #local P=B*R;
         #if (P<=1)
            #local X=pow(P, (1/Alpha));
         #else
            #local X=-ln((B-P)/Alpha);
         #end
         #local R1=rand(Stream); 
         #if(!( ((P<=1) & (R1>exp(-X))) | ((P>1) & (R1>pow(X,Alpha-1))) ))
             #local RETURN=X;
             #local Loop=false;
         #end
      #end
   #end
   #local Return=Beta*RETURN;
   Return
#end

// Beta variate
// Input: Alpha= shape Gamma1, Beta= shape Gamma2 and a random stream.
#macro Rand_Beta(Alpha, Beta, Stream)
   #if(Alpha<=0 | Beta<=0)
      #error "Alpha and Beta should be bigger than 0"
   #end 
   #local Gamma1=Rand_Gamma(Alpha,1,Stream);
   #if (Gamma1=0)
      #local Return=0;
   #else
      #local Return=(Gamma1/(Gamma1+Rand_Gamma(Beta,1,Stream)));
   #end
   (Return)
#end

// Chi Square random variate
// Input: N= degrees of freedom int() and a random stream
#macro Rand_Chi_Square(N, Stream)
   (Rand_Gamma(2,0.5*int(N),Stream))
#end

// F-Distribution
// Input: N, M degrees of freedom and a random stream.
#macro Rand_F_Dist(N, M, Stream)
   #local C1=Rand_Chi_Square(M,Stream);
   #local C2=Rand_Chi_Square(N,Stream);
   #local Return=(M*C1)/(N*C2);
   (Return)
#end

//Triangular distribution
//Input: Min, Max, Mode (Min < Mode < Max) and a random stream
#macro Rand_Triangle(Min, Max, Mode, Stream)
   #local Right=Max-Mode;
   #local Left=Mode-Min;
   #local Range=Max-Min;
   #local R=rand(Stream);
   #if(R<=Left/Range)
      #local Return= Min+sqrt(Left*Range*R);
   #else
      #local Return= Max-sqrt(Right*Range*(1-R));
   #end
   (Return)
#end

// Erlang variate
// Input: Mu= mean >=0, K= number of exponential samples and a random stream.
#macro Rand_Erlang(Mu, K, Stream)
   #local Prod=1;
   #local I=0;
   #while(I<K)
      #local Prod=Prod*rand(Stream);
      #local I=I+1;
   #end
   (-Mu*ln(Prod))
#end

// Exponential distribution
// Input: Lambda = rate = 1/mean
#macro Rand_Exp(Lambda, Stream)
   (-ln(rand(Stream))/Lambda)
#end

// Lognormal distribution
// Input:  Mu=mean, Sigma= standard deviation and a random stream
#macro Rand_Lognormal(Mu, Sigma, Stream)
   (exp(Rand_Gauss(Mu,Sigma,Stream)))
#end

// Pareto distribution
#macro Rand_Pareto(Alpha, Stream)
   (1/pow(rand(Stream),(1/Alpha)))
#end

// Weibull distribution
#macro Rand_Weibull(Alpha, Beta, Stream)
   (Alpha*pow(-ln(rand(Stream)),(1/Beta)))
#end

////////////////////////////////////
//    Discrete Distribution       //
////////////////////////////////////

// Bernoulli distribution
// Input: P = probability range: 0 - 1. And a random stream.
// Output: the BOOLEAN value TRUE with a probability equal 
//         to the value of P and FALSE with a probability of 1 - P.
#macro Rand_Bernoulli(P,Stream)
   (P>=rand(Stream)?true:false)
#end

// Binomial distribution
// Input: N= number of trials, P= probability [0-1] and a random stream.
#macro Rand_Binomial(N, P, Stream)
   #local Count=0;
   #local N=int(N);
   #local I=0;
   #while (I<N)
      #if (rand(Stream)<=P)
         #local Count=Count+1;
      #end
      #local I=I+1;
   #end
   (Count)
#end

//Geometric distribution
//Input: P=probability [0-1] and a random stream.
#macro Rand_Geo(P, Stream)
   (floor(ln(rand(Stream))/ln(1-P)))
#end

// Poisson distribution
// Input: Mu= mean and a random stream.
#macro Rand_Poisson(Mu, Stream)
   #local Maxtimes = 100000;  //just to be sure
   #local Cut=exp(-Mu);
   #local N=0;
   #local R=1;
   #while (R>Cut)
      #local R=R*rand(Stream);
      #local N=N+1;
      #if(N>Maxtimes)
         #local R=Cut;
      #end
   #end
   (N)
#end



//signed random number, range [-1, 1]
#macro SRand(RS) (rand(RS)*2 - 1) #end

//random number in specified range [Min, Max]
#macro RRand(Min, Max, RS) (rand(RS)*(Max-Min) + Min) #end

//a random point in a box from < 0, 0, 0> to < 1, 1, 1>
#macro VRand(RS) < rand(RS), rand(RS), rand(RS)> #end

//a random point in a box from Mn to Mx
#macro VRand_In_Box(Mn, Mx, RS) (< rand(RS), rand(RS), rand(RS)>*(Mx-Mn) + Mn) #end

//a random point in a unit-radius sphere centered on the origin
//Thanks to Ingo for this macro, which is faster than the original VRand3()
#macro VRand_In_Sphere(Stream)
   #local R = pow(rand(Stream),1/3);
   #local Theta = 2*pi*rand(Stream);
   #local Phi = acos(2*rand(Stream)-1);
   (R*<cos(Theta)*sin(Phi),
       sin(Theta)*sin(Phi),
       cos(Phi)>)
#end

//a random point on a unit-radius sphere centered on the origin
//Author: Ingo
#macro VRand_On_Sphere(Stream)
   #local Theta = 2*pi*rand(Stream);
   #local Phi = acos(2*rand(Stream)-1);
   (<cos(Theta)*sin(Phi),
     sin(Theta)*sin(Phi),
     cos(Phi)>)
#end

//a random point inside an arbitrary object
//Warning: can be quite slow if the object occupies a small
//portion of the volume of it's bounding box!
//Also, will not work on objects without a definite "inside".
#macro VRand_In_Obj(Obj, RS)
    #local Mn = min_extent(Obj);
    #local Mx = max_extent(Obj);
    #local Pt = VRand_In_Box(Mn, Mx, RS);
    #local J = 0;
    #while(inside(Obj, Pt) = 0 & J < 1000)
        #local Pt = VRand_In_Box(Mn, Mx, RS);
        #local J = J + 1;
    #end
    (Pt)
#end


#version RAND_INC_TEMP;
#end//rand.inc

`,
    'screen.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//               Persistence of Vision Raytracer Version 3.5
//                           Screen Include File

// Created by Christoph Hormann, Chris Huff and Rune S. Johansen.

// Screen.inc will enable you to place objects and textures right in front
// of the camera. One use of this is to place your signature or a logo in
// the corner of the image.

// You can only use screen.inc with the perspective camera. Screen.inc
// will automatically create the camera definition for you when it is
// included.

// Note that even though objects aligned using screen.inc follow the
// camera, they are still part of the scene. That means that they will be
// affected by perspective, lighting, the surroundings etc.

// For instructions of use, look in the POV-Ray manual, and for an example
// of use, see screen.pov.


#ifndef(Screen_Inc_Temp)
#declare Screen_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
   #debug "including screen.inc\\n"
#end

#macro Update_Camera()
   
   #ifndef (Camera_Aspect_Ratio)
      #declare Camera_Aspect_Ratio = image_width/image_height;
   #end
   #ifndef (Camera_Location) #declare Camera_Location = <0,0,0>; #end
   #ifndef (Camera_Look_At)  #declare Camera_Look_At = z;        #end
   #ifndef (Camera_Sky)      #declare Camera_Sky = y;            #end
   #ifndef (Camera_Zoom)     #declare Camera_Zoom = 1;           #end
   
   
   #declare CamL=Camera_Location;                     // wherever you're putting it
   #declare CamD=vnormalize(Camera_Look_At-CamL);     // direction of camera view
   #declare CamR=vnormalize(vcross(Camera_Sky,CamD)); // to the right
   #declare CamU=vnormalize(vcross(CamD,CamR));       // camera up
   #declare Camera_Transform =
   transform {
      matrix <
         CamR.x, CamR.y, CamR.z,
         CamU.x, CamU.y, CamU.z,
         CamD.x, CamD.y, CamD.z,
         CamL.x, CamL.y, CamL.z
      >
   }
   
   camera {
     direction CamD*Camera_Zoom
     right CamR*Camera_Aspect_Ratio
     up CamU
     sky Camera_Sky
     location CamL
   }
   
#end

Update_Camera()

#macro Set_Camera_Location(Loc)
   #declare Camera_Location = Loc;
   Update_Camera()
#end
#macro Set_Camera_Look_At(LookAt)
   #declare Camera_Look_At = LookAt;
   Update_Camera()
#end
#macro Set_Camera_Aspect_Ratio(Aspect)
   #declare Camera_Aspect_Ratio = Aspect;
   Update_Camera()
#end
#macro Set_Camera_Aspect(Width,Height)
   #declare Camera_Aspect_Ratio = Width/Height;
   Update_Camera()
#end
#macro Set_Camera_Sky(Sky)
   #declare Camera_Sky = Sky;
   Update_Camera()
#end
#macro Set_Camera_Zoom(Zoom)
   #declare Camera_Zoom = Zoom;
   Update_Camera()
#end
#macro Set_Camera_Angle(Angle)
   #declare Camera_Zoom = 0.5/tan(radians(Angle/2))*Camera_Aspect_Ratio;
   Update_Camera()
#end
#macro Set_Camera(Location, LookAt, Angle)
   #declare Camera_Location = Location;
   #declare Camera_Look_At = LookAt;
   Set_Camera_Angle(Angle)
   Update_Camera()
#end
#macro Reset_Camera()
   #undef Camera_Location
   #undef Camera_Aspect_Ratio
   #undef Camera_Location
   #undef Camera_Look_At
   #undef Camera_Sky
   #undef Camera_Zoom
   Update_Camera()
#end

#macro Screen_Object (Object, Position, Spacing, Confine, Scaling)
   #local Obj_Max = max_extent(Object);
   #local Obj_Min = min_extent(Object);
   #local Obj_Cen = (Obj_Max+Obj_Min)/2;
   #local Obj_Dim = (Obj_Max-Obj_Min)/2;
   #local Pos = (Position-0.5)*2;
   #local Pos = (
      +<Pos.x*Camera_Aspect_Ratio/2,Pos.y/2,Camera_Zoom>
      +( -Obj_Cen -Pos*(Obj_Dim+Spacing) ) * Confine
   );
   object {
      Object
      no_shadow     // shouldn't cast shadows in the scene
      no_reflection // shouldn't be reflected in scene elements
      no_radiosity  // also make the object invisible to radiosity rays
      translate Pos
      scale Scaling
      transform {Camera_Transform}
   }
#end

#macro Screen_Plane (Texture, Scaling, BLCorner, TRCorner)
   box {
      <-0.000001,-0.000001,0>, <+1.000001,+1.000001,0>
      texture {Texture}
      scale TRCorner*<1,1,0>-BLCorner*<1,1,0>+z
      translate BLCorner*<1,1,0>+<-0.5,-0.5,0>
      scale <Camera_Aspect_Ratio,1,1>
      no_shadow     // shouldn't cast shadows in the scene
      no_reflection // shouldn't be reflected in scene elements
      hollow on     // for media/fog
      translate Camera_Zoom*z
      scale Scaling
      transform {Camera_Transform}
   }
#end

#version Screen_Inc_Temp;
#end
`,
    'shapes.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: shapes.inc
//    Last updated: April-2013
//    Description: This file contains macros for working with objects, as well
//    as macros for creating special objects, such as bevelled text,
//    height fields, and rounded shapes.

#ifndef( Shapes_Inc_Temp )
#declare Shapes_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
   #debug "including shapes.inc\\n"
#end

#include "shapes_old.inc"
#include "consts.inc"
#include "transforms.inc"
#include "strings.inc"
#include "math.inc"

// These macros are just interfaces to the trace() function.
// They return values through their parameters:
// If an intersection is found, they return true and set
// OPt to the intersection point, and ONorm to the normal.
// Otherwise they return false, and do not modify OPt or ONorm.
#macro Isect(Pt, Dir, Obj, OPt)
   #local Norm = <0,0,0>;
   #local IPt = trace(Obj, Pt, Dir, Norm);
   #if (vlength(Norm) > 0)
      #declare OPt = IPt;
      #local Return=true;
   #else
      #local Return=false;
   #end
   (Return)
#end
#macro IsectN(Pt, Dir, Obj, OPt, ONorm)
   #local Norm = <0,0,0>;
   #local IPt = trace(Obj, Pt, Dir, Norm);
   #if (vlength(Norm) > 0)
      #declare OPt = IPt;
      #declare ONorm = Norm;
      #local Return=true;
   #else
      #local Return=false;
   #end
   (Return)
#end


// A shortcut for getting both min and max extents of an object
#macro Extents(Obj, Min, Max)
   #declare Min = min_extent(Obj);
   #declare Max = max_extent(Obj);
#end


// shortcuts for using the CenterTrans and AlignTrans
// macros with objects.
#macro Center_Object(Object, Axis)
   object {Object Center_Trans(Object, Axis)}
#end

#macro Align_Object(Object, Axis, Pt)
   object {Object Align_Trans(Object, Axis, Pt)}
#end


// A simple beveled text macro. The parameters are:
// Font: the name of the font file.
// String: the text string the text object is composed of.
// Cuts: the number of times excess material is cut off, to form the bevel.
//       More cuts will give smoother results, but take longer to render.
// BevelAng: the angle of the bevel.
// BevelDepth: the depth of the bevelled portion of the text.
// Depth: the total depth of the text object.
// Offset: the offset value for the text object.  Since the front faces of each
//         letter need to be in the same plane, z values are ignored.
#macro Bevelled_Text(Font, String, Cuts, BevelAng, BevelDepth, Depth, Offset, UseMerge)
   #if(UseMerge)
      merge {
   #else
      union {
   #end
      text {ttf Font, String Depth-BevelDepth, Offset*(x+y)}
      intersection {
         #local J=0;
         #while(J<Cuts)
            #local A = 2*pi*J/(Cuts);
            #local CA = cos(radians(BevelAng));
            #local SA = sin(radians(BevelAng));
            text {ttf Font, String BevelDepth, Offset*(x+y)
               translate -z*(BevelDepth+J*0.0001)
               Shear_Trans(x, y, < cos(A)*SA, sin(A)*SA, CA>/CA)
            }
            #local J=J+1;
         #end
      }
      translate z*BevelDepth
   }
#end


// Constants used for the text macros
#declare Align_Left = 1;
#declare Align_Right = 2;
#declare Align_Center = 3;

/* Text_Space( Font, String, Size, Spacing )
Computes the width of a text string, including "white space". It
returns the advance widths of all n letters. Text_Space gives the
space a text or a glyph occupies in regard to its surroundings.

Font:    The font to use (see the documentation for the text object)
String:  The text for which we want to know the width
Size:    The size to which the text should be scaled
Spacing: The amount of space to add between the letters. */

#macro Text_Space(Font, String, Size, Spacing)
   #local TO = text {ttf Font concat("|",String,"|") 1 Spacing*x scale <Size,Size,1>}
   #local SO = text {ttf Font "||"                   1 Spacing*x scale <Size,Size,1>}
   ((max_extent(TO).x-min_extent(TO).x)-(max_extent(SO).x-min_extent(SO).x))
#end

/* Text_Width( Font, String, Size, Spacing )
Computes the width of a text string. It returns the advance widths
of the first n-1 letters, plus the glyph width of the last letter.
Text_Width gives the "fysical" width of the text and if you use
only one letter the "fysical" width of one glyph.

Font:    The font to use (see the documentation for the text object)
String:  The text for which we want to know the width
Size:    The size to which the text should be scaled
Spacing: The amount of space to add between the letters. */

#macro Text_Width(Font, String, Size, Spacing)
   #local TO = text {ttf Font String 1 Spacing*x scale <Size,Size,1>}
   (max_extent(TO).x-min_extent(TO).x)
#end

// Circle_Text author: Ron Parker
/* Circle_Text( Font, Text, Size, Spacing, Thickness, Radius, Inverted,
                Justification, Angle )
Creates a text object with the bottom (or top) of the character cells aligned
with all or part of a circle.  This macro should be used inside an object{...}
block.

         Font: The font to use (see the documentation for the text object)
         Text: The text string to be created
         Size: The height of the text string, as you would use to scale a
               standard text object
      Spacing: The amount of space to add between the letters.
    Thickness: The thickness of the letters (see the documentation for the
               text object)
       Radius: The radius of the circle along which the letters are aligned
     Inverted: If this parameter is nonzero, the tops of the letters will
               point toward the center of the circle.  Otherwise, the bottoms
               of the letters will do so.
Justification: One of the constants Align_Left, Align_Right, or Align_Center
        Angle: The point on the circle from which rendering will begin.  The
               +x direction is 0 and the +y direction is 90 (i.e. the angle
               increases anti-clockwise. */
 
#macro Circle_Text(F, T, S, Sp, Th, R, I, J, A) //----------------------------------------
object{ Circle_Text_Valigned( F, // Font, i.e.: "arial.ttf", 
                              T, // Text, i.e.: "POVRay",
                              S, // LetterSize,    i.e.:  0.75, 
                              Sp,// LetterSpacing, i.e.: 0.025,
                              Th,// Deepth,        i.e.: 15.00, 
                              R, // Radius,        i.e.: 1.25
                              I, // Inverted,      0 or 1
                              J, // Justification: Align_Left, Align_Right, or Align_Center  
                              A, // Circle angle
                              0  // Valign:  Rotates for vertical objects. 
                                 //   -90 = right side up, 90 = upside-down, 0 = horzontal.
                            ) }  //-------------------------------------------------------- 
#end //-------------------------------------------------------------- end macro Circle_Text

// Cicle_Text macro expanded by rotating the letters: 
#macro Circle_Text_Valigned( F, // Font, i.e.: "arial.ttf", 
                             T, // Text, i.e.: "POVRay",
                             S, // LetterSize,    i.e.:  0.75, 
                             Sp,// LetterSpacing, i.e.: 0.025,
                             Th,// Deepth,        i.e.: 15.00, 
                             R, // Radius,        i.e.: 1.25
                             I, // Inverted,      0 or 1
                             J, // Justification: Align_Left, Align_Right, or Align_Center  
                             A, // Circle angle
                             Valign// Valign:  Rotates the letters. -90 = right side up, 90 = upside-down, 0 = horzontal.
                           ) //----------------------------------------------------------------------------------------------  
   #local FW = Text_Width(F, T, S, Sp);
   #local TO = text {ttf F T 1 0 scale<S, S, 1>}
   #local TH = max_extent(TO).y;
   #local C = array[strlen(T)]
   #if(FW > 2*pi*R)
      #error concat("\\n\\n**** Text string \\"", T, "\\" is too long for a circle of the specified radius.\\n\\n\\n")
   #end
   #local AW = -FW*180/pi/R;
   #local SA = A;
   #local EA = A + AW;
   #if(((J = Align_Right) & !I)|((J = Align_Left) & I))
      #local SA = A - AW;
      #local EA = A;
   #else
      #if(J = Align_Center)
         #local SA = A - AW/2;
         #local EA = A + AW/2;
      #end
   #end

   #local CI = 1;
   #while(CI <= strlen(T))
      #local OE = Text_Width(F, substr(T,CI,1), S, Sp);
      #local LW = Text_Width(F, substr(T,1,CI), S, Sp) - OE;
      #local LA = SA + AW*LW/FW + OE/2/FW*AW;
      #if(I)
         #local LA = EA - (LA - SA);
      #end
      #local TO = text {ttf F substr(T, CI, 1) Th 0 scale<S,S,1> rotate x*Valign}
      #if(I)
         #local C[CI-1] =
         object {TO
            rotate 180*z
            translate <OE/2, TH, 0>
            rotate -90*z
            translate R*x
            rotate LA*z
         }
      #else
         #local C[CI-1] =
         object {TO
            translate -OE/2*x
            rotate -90*z
            translate R*x
            rotate LA*z
         }
      #end
      #local CI = CI + 1;
   #end

   // Create the final object, a union of individual text object letters.
   union {
      #local CI=0;
      #while(CI < strlen(T))
         object {C[CI]}
         #local CI = CI + 1;
      #end
   }
// --------------------------------------------------------------------------------------
#end// of macro --------------------------------------------- end of macro Circle_Text_Valigned


#macro Wedge(Angle)
   #local A = clamp(Angle, 0, 360);
   #if(A < 180)
      difference {
         plane {-x, 0}
         plane {-x, 0 rotate y*A}
      }
   #else
      #if(A = 180)
         plane {-x, 0}
      #else
         intersection {
            plane {x, 0}
            plane {-x, 0 rotate y*A}
            inverse
         }
      #end
   #end
#end


#macro Spheroid(Center, Radius)
   sphere { 0, 1 scale Radius translate Center }
#end


#macro Supertorus(RMj, RMn, MajorControl, MinorControl, Accuracy, MaxGradient)
   #local CP = 2/MinorControl;
   #local RP = 2/MajorControl;
   isosurface {
      function { pow( pow(abs(pow(pow(abs(x),RP) + pow(abs(z),RP), 1/RP) - RMj),CP) + pow(abs(y),CP) ,1/CP) - RMn }
      threshold 0
      contained_by {box {<-RMj-RMn,-RMn,-RMj-RMn>, < RMj+RMn, RMn, RMj+RMn>}}
      #if(MaxGradient >= 1)
         max_gradient MaxGradient
      #else
         evaluate 1, 10, 0.1
      #end
      accuracy Accuracy
   }
#end


// Supercone author: Juha Nieminen
// A cone object where each end is an ellipse, you specify two radii
// for each end.
// SuperCone function: (x^2/a^2+y^2/b^2-1)*(1-z) + (x^2/c^2+y^2/d^2-1)*z = 0
//
// camera { location <6,5,-10> look_at 0 angle 35 }
// light_source { <100,100,-20>,1 }
// plane { y,-1.5 pigment { checker rgb 1, rgb .5 } }
// object { SuperCone(<0,-1.5,0>,1,2, <0,1.5,0>,1,.5)
//     pigment { rgb x } finish { specular .5 }
// }
#macro Supercone(PtA, A, B, PtB, C, D)
   intersection {
      quartic {
         <0, 0,  0,  0,  0,  0,  0,  B*B-2*B*D+D*D, 2*(B*D-B*B), B*B,
         0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
         0,  0,  0, A*A-2*A*C+C*C, 2*(A*C-A*A), A*A, 0,  0,  0,  0,
         -(A*A-2*A*C+C*C)*(B*B-2*B*D+D*D),
         -(2*((B*D-B*B)*(A*A-2*A*C+C*C)+(A*C-A*A)*(B*B-2*B*D+D*D))),
         -(B*B*(A*A-2*A*C+C*C)+4*(A*C-A*A)*(B*D-B*B)+A*A*(B*B-2*B*D+D*D)),
         -(2*(B*B*(A*C-A*A)+A*A*(B*D-B*B))), -A*A*B*B>
         sturm
      }
      cylinder {0, z, max(max(abs(A), abs(B)), max(abs(C), abs(D)))}

      bounded_by {cone {0, max(abs(A), abs(B)), z, max(abs(C), abs(D))}}

      #local Dirv = PtB - PtA;
      scale <1,1,vlength(Dirv)>
      #local Dirv = vnormalize(Dirv);
      #if(vlength(Dirv-<0,0,-1>)=0) scale <1,1,-1>
      #else Reorient_Trans(z, Dirv)
      #end
      translate PtA
   }
#end


// Connect two spheres with a cylinder.
// Derived from Connect() macro by John VanSickle
#macro Connect_Spheres(PtA, RadiusA, PtB, RadiusB)
   #local Axis = PtB - PtA;
   #local RadDif = RadiusA - RadiusB;
   #local Len = VDist(PtA, PtB);
   #local D2 = sqrt(f_sqr(Len) - f_sqr(RadDif));

   cone {
      PtA + Axis/Len*RadDif*RadiusA/Len, RadiusA*D2/Len,
      PtB + Axis/Len*RadDif*RadiusB/Len, RadiusB*D2/Len
   }
#end


#macro Wire_Box_Union(A, B, WireRadius)
   Wire_Box(A, B, WireRadius, no)
#end
#macro Wire_Box_Merge(A, B, WireRadius)
   Wire_Box(A, B, WireRadius, yes)
#end
#macro Wire_Box(A, B, WireRadius, UseMerge)
   #local AA = <min(A.x, B.x), min(A.y, B.y), min(A.z, B.z)>;
   #local BB = <max(A.x, B.x), max(A.y, B.y), max(A.z, B.z)>;

   #local Delta=abs(BB.x-AA.x)/2;
   #if (Delta<WireRadius)
      #warning "\\nWire_Box() macro called with x-size < Radius,\\nresults may not be as expected\\n"

      #local AA = <AA.x+Delta, AA.y, AA.z>;
      #local BB = <BB.x-Delta, BB.y, BB.z>;
   #else
      #local AA = <AA.x+WireRadius, AA.y, AA.z>;
      #local BB = <BB.x-WireRadius, BB.y, BB.z>;
   #end

   #local Delta=abs(BB.y-AA.y)/2;
   #if (Delta<WireRadius)
      #warning "\\nWire_Box() macro called with y-size < Radius,\\nresults may not be as expected\\n"

      #local AA = <AA.x, AA.y+Delta, AA.z>;
      #local BB = <BB.x, BB.y-Delta, BB.z>;
   #else
      #local AA = <AA.x, AA.y+WireRadius, AA.z>;
      #local BB = <BB.x, BB.y-WireRadius, BB.z>;
   #end

   #local Delta=abs(BB.z-AA.z)/2;
   #if (Delta<WireRadius)
      #warning "\\nWire_Box() macro called with z-size < Radius,\\nresults may not be as expected\\n"

      #local AA = <AA.x, AA.y, AA.z+Delta>;
      #local BB = <BB.x, BB.y, BB.z-Delta>;
   #else
      #local AA = <AA.x, AA.y, AA.z+WireRadius>;
      #local BB = <BB.x, BB.y, BB.z-WireRadius>;
   #end

   #local LBF = AA;
   #local RBF = < BB.x, AA.y, AA.z>;
   #local RBB = < BB.x, AA.y, BB.z>;
   #local LBB = < AA.x, AA.y, BB.z>;
   #local LTF = < AA.x, BB.y, AA.z>;
   #local RTF = < BB.x, BB.y, AA.z>;
   #local RTB = BB;
   #local LTB = < AA.x, BB.y, BB.z>;

   #if(UseMerge)
      merge {
   #else
      union {
   #end
      sphere {LBF, WireRadius}

      #if (AA.x != BB.x)
         sphere {RBF, WireRadius}
      #end
      #if ((AA.x != BB.x) & (AA.z != BB.z))
         sphere {RBB, WireRadius}
      #end
      #if (AA.z != BB.z)
         sphere {LBB, WireRadius}
      #end

      #if (AA.y != BB.y)
         sphere {LTF, WireRadius}
      #end
      #if ((AA.x != BB.x) & (AA.y != BB.y))
         sphere {RTF, WireRadius}
      #end
      #if ((AA.x != BB.x) & (AA.y != BB.y) & (AA.z != BB.z))
         sphere {RTB, WireRadius}
      #end
      #if ((AA.y != BB.y) & (AA.z != BB.z))
         sphere {LTB, WireRadius}
      #end

      #if (AA.x != BB.x)
         cylinder {LBF, RBF, WireRadius}
         cylinder {LBB, RBB, WireRadius}
         cylinder {LTB, RTB, WireRadius}
         cylinder {LTF, RTF, WireRadius}
      #end

      #if (AA.y != BB.y)
         cylinder {LBF, LTF, WireRadius}
         cylinder {RBF, RTF, WireRadius}
         cylinder {RBB, RTB, WireRadius}
         cylinder {LBB, LTB, WireRadius}
      #end

      #if (AA.z != BB.z)
         cylinder {LTB, LTF, WireRadius}
         cylinder {LBB, LBF, WireRadius}
         cylinder {RTB, RTF, WireRadius}
         cylinder {RBB, RBF, WireRadius}
      #end
   }
#end

#macro Round_Box_Union(A, B, EdgeRadius)
   Round_Box(A, B, EdgeRadius, no)
#end
#macro Round_Box_Merge(A, B, EdgeRadius)
   Round_Box(A, B, EdgeRadius, yes)
#end
#macro Round_Box(A, B, EdgeRadius, UseMerge)
   #local AA = <min(A.x, B.x), min(A.y, B.y), min(A.z, B.z)>;
   #local BB = <max(A.x, B.x), max(A.y, B.y), max(A.z, B.z)>;

   #local Delta=abs(BB.x-AA.x)/2;
   #if (Delta<EdgeRadius)
      #warning "\\nRound_Box() macro called with x-size < Radius,\\nresults may not be as expected\\n"

      #local AA = <AA.x+Delta, AA.y, AA.z>;
      #local BB = <BB.x-Delta, BB.y, BB.z>;
   #else
      #local AA = <AA.x+EdgeRadius, AA.y, AA.z>;
      #local BB = <BB.x-EdgeRadius, BB.y, BB.z>;
   #end

   #local Delta=abs(BB.y-AA.y)/2;
   #if (Delta<EdgeRadius)
      #warning "\\nRound_Box() macro called with y-size < Radius,\\nresults may not be as expected\\n"

      #local AA = <AA.x, AA.y+Delta, AA.z>;
      #local BB = <BB.x, BB.y-Delta, BB.z>;
   #else
      #local AA = <AA.x, AA.y+EdgeRadius, AA.z>;
      #local BB = <BB.x, BB.y-EdgeRadius, BB.z>;
   #end

   #local Delta=abs(BB.z-AA.z)/2;
   #if (Delta<EdgeRadius)
      #warning "\\nRound_Box() macro called with z-size < Radius,\\nresults may not be as expected\\n"

      #local AA = <AA.x, AA.y, AA.z+Delta>;
      #local BB = <BB.x, BB.y, BB.z-Delta>;
   #else
      #local AA = <AA.x, AA.y, AA.z+EdgeRadius>;
      #local BB = <BB.x, BB.y, BB.z-EdgeRadius>;
   #end

   #local LBF = AA;
   #local RBF = < BB.x, AA.y, AA.z>;
   #local RBB = < BB.x, AA.y, BB.z>;
   #local LBB = < AA.x, AA.y, BB.z>;
   #local LTF = < AA.x, BB.y, AA.z>;
   #local RTF = < BB.x, BB.y, AA.z>;
   #local RTB = BB;
   #local LTB = < AA.x, BB.y, BB.z>;

   #if(UseMerge)
      merge {
   #else
      union {
   #end
      sphere {LBF, EdgeRadius}

      #if (AA.x != BB.x)
         sphere {RBF, EdgeRadius}
      #end
      #if ((AA.x != BB.x) & (AA.z != BB.z))
         sphere {RBB, EdgeRadius}
      #end
      #if (AA.z != BB.z)
         sphere {LBB, EdgeRadius}
      #end

      #if (AA.y != BB.y)
         sphere {LTF, EdgeRadius}
      #end
      #if ((AA.x != BB.x) & (AA.y != BB.y))
         sphere {RTF, EdgeRadius}
      #end
      #if ((AA.x != BB.x) & (AA.y != BB.y) & (AA.z != BB.z))
         sphere {RTB, EdgeRadius}
      #end
      #if ((AA.y != BB.y) & (AA.z != BB.z))
         sphere {LTB, EdgeRadius}
      #end

      #if (AA.x != BB.x)
         cylinder {LBF, RBF, EdgeRadius}
         cylinder {LBB, RBB, EdgeRadius}
         cylinder {LTB, RTB, EdgeRadius}
         cylinder {LTF, RTF, EdgeRadius}
      #end

      #if (AA.y != BB.y)
         cylinder {LBF, LTF, EdgeRadius}
         cylinder {RBF, RTF, EdgeRadius}
         cylinder {RBB, RTB, EdgeRadius}
         cylinder {LBB, LTB, EdgeRadius}
      #end

      #if (AA.z != BB.z)
         cylinder {LTB, LTF, EdgeRadius}
         cylinder {LBB, LBF, EdgeRadius}
         cylinder {RTB, RTF, EdgeRadius}
         cylinder {RBB, RBF, EdgeRadius}
      #end

      box {AA-EdgeRadius*x, BB+EdgeRadius*x}
      box {AA-EdgeRadius*y, BB+EdgeRadius*y}
      box {AA-EdgeRadius*z, BB+EdgeRadius*z}
   }
#end

#macro Round_Cylinder_Union(A, B, Radius, EdgeRadius)
   Round_Cylinder(A, B, Radius, EdgeRadius, no)
#end
#macro Round_Cylinder_Merge(A, B, Radius, EdgeRadius)
   Round_Cylinder(A, B, Radius, EdgeRadius, yes)
#end
#macro Round_Cylinder(A, B, Radius, EdgeRadius, UseMerge)

   #if(UseMerge)
      merge {
   #else
      union {
   #end

      #if(Radius<EdgeRadius)
         #warning "\\nRound_Cylinder() macro called with Radius < EdgeRadius,\\nresults may not be as expected\\n"

         #local AA = A + vnormalize(B - A)*Radius;
         #local BB = B + vnormalize(A - B)*Radius;

         cylinder {AA, BB, Radius}
         sphere {0, Radius translate AA }
         sphere {0, Radius translate BB }

      #else

         #local AA = A + vnormalize(B - A)*EdgeRadius;
         #local BB = B + vnormalize(A - B)*EdgeRadius;

         cylinder {A, B, Radius - EdgeRadius}
         cylinder {AA, BB, Radius}
         torus {Radius - EdgeRadius, EdgeRadius translate y*EdgeRadius
            Point_At_Trans(B - A)
            translate A
         }
         torus {Radius - EdgeRadius, EdgeRadius translate y*(vlength(A - B) - EdgeRadius)
            Point_At_Trans(B - A)
            translate A
         }

      #end
   }
#end


// Rounded cone with torus edges
// This shape will fit entirely within a cone given the same parameters.
#macro Round_Cone_Union(PtA, RadiusA, PtB, RadiusB, EdgeRadius)
   Round_Cone(PtA, RadiusA, PtB, RadiusB, EdgeRadius, no)
#end
#macro Round_Cone_Merge(PtA, RadiusA, PtB, RadiusB, EdgeRadius)
   Round_Cone(PtA, RadiusA, PtB, RadiusB, EdgeRadius, yes)
#end
#macro Round_Cone(PtA, RadiusA, PtB, RadiusB, EdgeRadius, UseMerge)
   #if(min(RadiusA, RadiusB) < EdgeRadius)
     #warning "\\nRound_Cone() macro called with Radius < EdgeRadius,\\nresults may not be as expected\\n"
   #end

   #if(RadiusA > RadiusB)
      #local RA = RadiusB;
      #local RB = RadiusA;
      #local PA = PtB;
      #local PB = PtA;
   #else
      #local RA = RadiusA;
      #local RB = RadiusB;
      #local PA = PtA;
      #local PB = PtB;
   #end

   #local Axis = vnormalize(PB - PA);
   #local Len = VDist(PA, PB);
   #local SA = atan2(RB - RA, Len);

   #if(UseMerge)
      merge {
   #else
      union {
   #end
      #local R1 = RA - EdgeRadius*tan(pi/4 - SA/2);
      #local R2 = RB - EdgeRadius/tan(pi/4 - SA/2);

      torus {R1, EdgeRadius
         Point_At_Trans(Axis) translate PA + Axis*EdgeRadius
      }
      torus {R2, EdgeRadius
         Point_At_Trans(Axis) translate PB - Axis*EdgeRadius
      }

      #local D1 = EdgeRadius - EdgeRadius*sin(SA);
      #local D2 = EdgeRadius + EdgeRadius*sin(SA);

      cone {
         PA + Axis*D1, R1 + EdgeRadius*cos(SA),
         PB - Axis*D2, R2 + EdgeRadius*cos(SA)
      }

      cone {PA, R1, PB, R2}
   }
#end


// Cones with spherical caps
// Sphere-capped cone object with spheres centered on end points.
// Derived from Connect() macro by John VanSickle
#macro Round_Cone2_Union(PtA, RadiusA, PtB, RadiusB)
   Round_Cone2(PtA, RadiusA, PtB, RadiusB, no)
#end
#macro Round_Cone2_Merge(PtA, RadiusA, PtB, RadiusB)
   Round_Cone2(PtA, RadiusA, PtB, RadiusB, yes)
#end
#macro Round_Cone2(PtA, RadiusA, PtB, RadiusB, UseMerge)
   #local Axis = PtB - PtA;
   #local RadDif = RadiusA - RadiusB;
   #local Len = VDist(PtA, PtB);

   #local D2 = f_sqr(Len) - f_sqr(RadDif);
   #if(D2<0)
     #error "Round_Cone2() macro called with parameters that can't be handled correctly"
   #end
   #local D2 = sqrt(D2);

   #if(UseMerge)
      merge {
   #else
      union {
   #end
      sphere {PtA, RadiusA}
      sphere {PtB, RadiusB}

      cone {
         PtA + Axis/Len*RadDif*RadiusA/Len, RadiusA*D2/Len,
         PtB + Axis/Len*RadDif*RadiusB/Len, RadiusB*D2/Len
      }
   }
#end

// Sphere-capped cone object with spheres moved and resized
// to fit ends of cone.
// The cone portion is identical to what you would get using
// a cone object with the same parameters, but the spheres are
// not centered on the endpoints of the cone, but are moved
// to give a smooth transition with the surface
#macro Round_Cone3_Union(PtA, RadiusA, PtB, RadiusB)
   Round_Cone3(PtA, RadiusA, PtB, RadiusB, no)
#end
#macro Round_Cone3_Merge(PtA, RadiusA, PtB, RadiusB)
   Round_Cone3(PtA, RadiusA, PtB, RadiusB, yes)
#end
#macro Round_Cone3(PtA, RadiusA, PtB, RadiusB, UseMerge)
   #local Axis = vnormalize(PtB - PtA);
   #local Len = VDist(PtA, PtB);
   #local SA = atan2(RadiusB - RadiusA, Len);

   #if(UseMerge)
      merge {
   #else
      union {
   #end
      cone {PtA, RadiusA, PtB, RadiusB}
      sphere {PtA + Axis*tan(SA)*RadiusA, RadiusA/cos(SA)}
      sphere {PtB + Axis*tan(SA)*RadiusB, RadiusB/cos(SA)}
   }
#end

// Two-triangle quad
//  A---B
//  |\\  |
//  | \\ |
//  |  \\|
//  D---C
#macro Quad(A, B, C, D)
   triangle {A, B, C}
   triangle {A, C, D}
#end
#macro Smooth_Quad(A, NA, B, NB, C, NC, D, ND)
   smooth_triangle {A, NA, B, NB, C, NC}
   smooth_triangle {A, NA, C, NC, D, ND}
#end


// HF Macros author: Rune S. Johansen
// Optimizations by: Wlodzimierz ABX Skiba
// There are several HF macros in shapes.inc, which generate meshes in various shapes.
// See more information in the help file.

#macro HF_Square (Function,UseUVheight,UseUVtexture,Res,Smooth,FileName,MnExt,MxExt)
   #local WriteFile = (strlen(FileName) > 0);
   #local xRes = (< 1, 1>*Res).x;
   #local zRes = (< 1, 1>*Res).y;
   #local UVheight  = (UseUVheight=1);
   #local UVtex = (UseUVtexture=1);
   #local Smooth = (Smooth=1);

   #local Ext = MxExt-MnExt;

   // CALCULTION OF POINT GRID
   // Note that the grid extents one element further in all directions
   // if a smooth heightfield is calculated. This is to ensure correct
   // normal calculation later on.
   #local PArr = array[xRes+1+Smooth][zRes+1+Smooth]
   #local J = 1-Smooth;
   #while (J<xRes+1+Smooth)
      #local K = 1-Smooth;
      #while (K<zRes+1+Smooth)

         #local UV = <(J-1)/(xRes-1),0,(K-1)/(zRes-1)>;

         #local P  = (UV*Ext*<1,0,1> + MnExt);

         #if (UVheight)
            #local H = Function(UV.x, UV.z, 0);
         #else
            #local H = Function(P.x, P.y, P.z);
         #end

         #declare PArr[J][K] = P + H*Ext*y;

         #declare K = K+1;
      #end
      #declare J = J+1;
   #end

   HFCreate_()
#end

#macro HF_Sphere (Function,UseUVheight,UseUVtexture,Res,Smooth,FileName,Center,Radius,Depth)
   #local WriteFile = (strlen(FileName) > 0);
   #local xRes = (< 1, 1>*Res).x;
   #local zRes = (< 1, 1>*Res).y;
   #local UVheight  = (UseUVheight=1);
   #local UVtex = (UseUVtexture=1);
   #local Smooth = (Smooth=1);

   // CALCULTION OF POINT GRID
   // Note that the grid extents one element further in all directions
   // if a smooth heightfield is calculated. This is to ensure correct
   // normal calculation later on.
   #local PArr = array[xRes+1+Smooth][zRes+1+Smooth]
   #local J = 1-Smooth;
   #while (J<xRes+1+Smooth)
      #local K = 1-Smooth;
      #while (K<zRes+1+Smooth)

         #local UV = <(J-1)/(xRes-1),0,(K-1)/(zRes-1)>;

         #local Dir = vrotate( vrotate(x,(-89.9999+179.9998*UV.z)*z), -360*UV.x*y );
         #local P  = Center + Dir * Radius;

         #if (UVheight)
            #local H = Function(UV.x, UV.z, 0);
         #else
            #local H = Function(P.x, P.y, P.z);
         #end

         #declare PArr[J][K] = P + H*Dir*Depth;

         #declare K = K+1;
      #end
      #declare J = J+1;
   #end

   HFCreate_()
#end

#macro HF_Cylinder (Function,UseUVheight,UseUVtexture,Res,Smooth,FileName,EndA,EndB,Radius,Depth)
   #local WriteFile = (strlen(FileName) > 0);
   #local xRes = (< 1, 1>*Res).x;
   #local zRes = (< 1, 1>*Res).y;
   #local UVheight  = (UseUVheight=1);
   #local UVtex = (UseUVtexture=1);
   #local Smooth = (Smooth=1);

   #local Axis = EndB-EndA;
   #local Base = VPerp_To_Vector(Axis);

   // CALCULTION OF POINT GRID
   // Note that the grid extents one element further in all directions
   // if a smooth heightfield is calculated. This is to ensure correct
   // normal calculation later on.
   #local PArr = array[xRes+1+Smooth][zRes+1+Smooth]
   #local J = 1-Smooth;
   #while (J<xRes+1+Smooth)
      #local K = 1-Smooth;
      #while (K<zRes+1+Smooth)

         #local UV = <(J-1)/(xRes-1),0,(K-1)/(zRes-1)>;

         #local Dir = vaxis_rotate(Base,Axis,-360*UV.x-90);
         #local P  = EndA+Axis*UV.z+Dir*Radius;

         #if (UVheight)
            #local H = Function(UV.x, UV.z, 0);
         #else
            #local H = Function(P.x, P.y, P.z);
         #end

         #declare PArr[J][K] = P + H*Dir*Depth;

         #declare K = K+1;
      #end
      #declare J = J+1;
   #end

   HFCreate_()
#end

#macro HF_Torus (Function,UseUVheight,UseUVtexture,Res,Smooth,FileName,Major,Minor,Depth)
   #local WriteFile = (strlen(FileName) > 0);
   #local xRes = (< 1, 1>*Res).x;
   #local zRes = (< 1, 1>*Res).y;
   #local UVheight  = (UseUVheight=1);
   #local UVtex = (UseUVtexture=1);
   #local Smooth = (Smooth=1);

   // CALCULTION OF POINT GRID
   // Note that the grid extents one element further in all directions
   // if a smooth heightfield is calculated. This is to ensure correct
   // normal calculation later on.
   #local PArr = array[xRes+1+Smooth][zRes+1+Smooth]
   #local J = 1-Smooth;
   #while (J<xRes+1+Smooth)
      #local K = 1-Smooth;
      #while (K<zRes+1+Smooth)

         #local UV = <(J-1)/(xRes-1),0,(K-1)/(zRes-1)>;

         #local Dir = vrotate(vrotate(-x,360*UV.z*z),-360*UV.x*y);
         #local P  = vrotate(Major*x,-360*UV.x*y)+Dir*Minor;

         #if (UVheight)
            #local H = Function(UV.x, UV.z, 0);
         #else
            #local H = Function(P.x, P.y, P.z);
         #end

         #declare PArr[J][K] = P + H*Dir*Depth;

         #declare K = K+1;
      #end
      #declare J = J+1;
   #end

   HFCreate_()
#end

// Internal macro - not intended to be called by user.
#macro HFCreate_ ()

   #if(WriteFile)
      #fopen _HFMACRO_OUTPUT_FILE FileName write
      #write(_HFMACRO_OUTPUT_FILE,"mesh2 {\\nvertex_vectors {\\n",xRes*zRes,
   #else
      mesh2 {vertex_vectors{xRes*zRes,
   #end

   #local J = 1;
   #while (J<=xRes)
      #local K = 1;
      #while (K<=zRes)
        #if(WriteFile)
          ",\\n",PArr[J][K],
        #else
          PArr[J][K],
        #end
         #declare K = K+1;
      #end
      #declare J = J+1;
   #end

   #if(WriteFile)
      "\\n}\\n")
   #else
      }
   #end

   #if (Smooth)
      #if(WriteFile)
         #write(_HFMACRO_OUTPUT_FILE,"normal_vectors {\\n",xRes*zRes,
      #else
         normal_vectors{xRes*zRes,
      #end

      // CALCULATION OF NORMAL VECTOR
      // We don't vnormalize the vectors from the current center point
      // to its neightbor points because we want a weighted average
      // where bigger areas contribute more. This also means that the
      // center point can be left out completely of the calculations:
      #local J = 1;
      #while (J<=xRes)
         #local K = 1;
         #while (K<=zRes)
           #if(WriteFile)
             ",\\n",vnormalize(vcross(PArr[J][K+1]-PArr[J][K-1], PArr[J+1][K]-PArr[J-1][K])),
           #else
             vnormalize(vcross(PArr[J][K+1]-PArr[J][K-1], PArr[J+1][K]-PArr[J-1][K])),
           #end
            #declare K = K+1;
         #end
         #declare J = J+1;
      #end
      #if(WriteFile)
         "\\n}\\n")
      #else
         }
      #end
   #end

   #if (UVtex)
      #if(WriteFile)
         #write(_HFMACRO_OUTPUT_FILE,"uv_vectors {\\n",xRes*zRes,
      #else
         uv_vectors{xRes*zRes,
      #end
      #local J = 1;
      #while (J<=xRes)
         #local K = 1;
         #while (K<=zRes)
           #if(WriteFile)
             ",\\n",<(J-1)/(xRes-1),(K-1)/(zRes-1)>,
           #else
             <(J-1)/(xRes-1),(K-1)/(zRes-1)>,
           #end
            #declare K = K+1;
         #end
         #declare J = J+1;
      #end
      #if(WriteFile)
         "\\n}\\n")
      #else
         }
      #end
   #end

   #if(WriteFile)
      #write(_HFMACRO_OUTPUT_FILE,"face_indices {\\n",(xRes-1)*(zRes-1)*2,
   #else
      face_indices{(xRes-1)*(zRes-1)*2,
   #end
   #local F1 = <0,zRes,zRes+1>;
   #local F2 = <0,zRes+1,1>;
   #local J = 0;
   #while (J<xRes-1)
      #local A = J*zRes;
      #while (mod(A+1,zRes))
        #if(WriteFile)
          ",\\n",F1+A,",\\n",F2+A,
        #else
          F1+A, F2+A,
        #end
         #local A = A+1;
      #end
      #local J = J+1;
   #end
   #if (UVtex)
      #if(WriteFile)
         "\\n}\\nuv_mapping\\n}")
         #fclose _HFMACRO_OUTPUT_FILE
      #else
         } uv_mapping}
      #end
   #else
      #if(WriteFile)
         "\\n}\\n}")
         #fclose _HFMACRO_OUTPUT_FILE
      #else
         }}
      #end
   #end

#end

#version Shapes_Inc_Temp;
#end//shapes.inc
`,
    'shapes2.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

#ifndef(Shapes2_Inc_Temp)
#declare Shapes2_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
#   debug "including shapes2.inc\\n"
#end

/*
              Persistence of Vision Raytracer Version 3.1
         Implements additional, useful, but seldom used shapes

                    Contents:
                    =========
            Tetrahedron       HalfCone_Y
            Octahedron        Pyramid
            Dodecahedron      Pyramid2
            Icosahedron       Square_X
            Rhomboid          Square_Y
            Hexagon           Square_Z
*/


// Shapes by Tom Price [75300,620]:
#declare Tetrahedron =
 intersection 
  {plane {-y,1}
   plane {-z,1 rotate <19.47,    0, 0>}
   plane {-z,1 rotate <19.47, -120, 0>}
   plane {-z,1 rotate <19.47,  120, 0>}
   
   bounded_by {sphere {0, 3}}
  }
   
#declare Octahedron = 
 intersection 
  {plane { z, 1 rotate < 35.26438968275, 0, 0>}
   plane { z, 1 rotate <-35.26438968275, 0, 0>}
   plane {-z, 1 rotate < 35.26438968275, 0, 0>}
   plane {-z, 1 rotate <-35.26438968275, 0, 0>}
   
   plane { x, 1 rotate <0, 0, -35.26438968275>}
   plane { x, 1 rotate <0, 0,  35.26438968275>}
   plane {-x, 1 rotate <0, 0, -35.26438968275>}
   plane {-x, 1 rotate <0, 0,  35.26438968275>}
   
   bounded_by {sphere {0, 1.7321}}
  }
   
#declare Dodecahedron = 
 intersection 
  {plane {-z, 1 rotate <-26.56505117708,    0, 0>}
   plane {-z, 1 rotate <-26.56505117708,  -72, 0>}
   plane {-z, 1 rotate <-26.56505117708, -144, 0>}
   plane {-z, 1 rotate <-26.56505117708, -216, 0>}
   plane {-z, 1 rotate <-26.56505117708, -288, 0>}
   
   plane {-z, 1 rotate <26.56505117708,  -36, 0>}
   plane {-z, 1 rotate <26.56505117708, -108, 0>}
   plane {-z, 1 rotate <26.56505117708, -180, 0>}
   plane {-z, 1 rotate <26.56505117708, -252, 0>}
   plane {-z, 1 rotate <26.56505117708, -324, 0>}
   
   plane { y, 1}
   plane {-y, 1}
   
   bounded_by {sphere {0, 1.2585}}
  }
   
#declare Icosahedron = 
 intersection 
  {plane {-z, 1 rotate <52.6625,    0, 0>}
   plane {-z, 1 rotate <52.6625,  -72, 0>}
   plane {-z, 1 rotate <52.6625, -144, 0>}
   plane {-z, 1 rotate <52.6625, -216, 0>}
   plane {-z, 1 rotate <52.6625, -288, 0>}
   
   plane {-z, 1 rotate <10.8125,    0, 0>}
   plane {-z, 1 rotate <10.8125,  -72, 0>}
   plane {-z, 1 rotate <10.8125, -144, 0>}
   plane {-z, 1 rotate <10.8125, -216, 0>}
   plane {-z, 1 rotate <10.8125, -288, 0>}
   
   plane {-z, 1 rotate <-52.6625,  -36, 0>}
   plane {-z, 1 rotate <-52.6625, -108, 0>}
   plane {-z, 1 rotate <-52.6625, -180, 0>}
   plane {-z, 1 rotate <-52.6625, -252, 0>}
   plane {-z, 1 rotate <-52.6625, -324, 0>}
   
   plane {-z, 1 rotate <-10.8125,  -36, 0>}
   plane {-z, 1 rotate <-10.8125, -108, 0>}
   plane {-z, 1 rotate <-10.8125, -180, 0>}
   plane {-z, 1 rotate <-10.8125, -252, 0>}
   plane {-z, 1 rotate <-10.8125, -324, 0>}
   
   bounded_by {sphere {0, 1.2585}}
  }

// Shapes by others
// Convenient  finite cone primitive, pointing up in the Y axis
#declare HalfCone_Y = 
 intersection 
  {object {Cone_Y}
   plane  { y, 0}
   plane  {-y, 2}
   translate <0, 1, 0>
   scale <0.5, 1, 0.5>
   
   bounded_by {sphere{0, 1.5}}
  }

/* Hexagonal Solid, axis along x */
#declare  Hexagon = 
 intersection
  {plane {z, 1}  /* Rotate 90 in z axis to stand up */
   plane {z, 1 rotate < 60, 0, 0>}
   plane {z, 1 rotate <120, 0, 0>}
   plane {z, 1 rotate <180, 0, 0>}
   plane {z, 1 rotate <240, 0, 0>}
   plane {z, 1 rotate <300, 0, 0>}
   plane { x, 1}
   plane {-x, 1}
   
   bounded_by {sphere{0, 1.5}}
  }

/* Three Dimensional 4-Sided Diamond */
#declare Rhomboid = 
 intersection 
  {plane {-x, 1 rotate <0, 0, -30>}
   plane { x, 1 rotate <0, 0, -30>}
   plane { z, 1}
   plane {-z, 1}
   plane { y, 1}
   plane {-y, 1}
   
   bounded_by {sphere{0, 2.3}}
  }

// Classic four-sided pyramids.
// The first can't be used correctly in CSG, the second can.
#declare Pyramid = 
   union { // This isn't true CSG, it's just used for convenience
      triangle { <-1, 0, -1>, <+1, 0, -1>, <0, 1, 0>  }
      triangle { <+1, 0, -1>, <+1, 0, +1>, <0, 1, 0>  }
      triangle { <-1, 0, +1>, <+1, 0, +1>, <0, 1, 0>  }
      triangle { <-1, 0, +1>, <-1, 0, -1>, <0, 1, 0>  }

      triangle { <-1, 0, -1>, <-1, 0, +1>, <1, 0, +1>  }
      triangle { <-1, 0, -1>, <+1, 0, -1>, <1, 0, +1>  }

   scale <1, 2, 1>
   translate -y
}
#declare Pyramid2 = intersection {
   plane { < 1, 0,  0>, 1  rotate <  0, 0,  40>}
   plane { <-1, 0,  0>, 1  rotate <  0, 0, -40>}
   plane { < 0, 0,  1>, 1  rotate <-40, 0,   0>}
   plane { < 0, 0, -1>, 1  rotate < 40, 0,   0>}
   plane { <0, -1, 0>, 0 }
   translate <0 ,-1, 0>
   
   bounded_by {box {<-1,0,-1>, <1,1,1>}}
}            
             
// These next three are finite planes.
#declare Square_X = /* Scale-able plane in x */
  union 
   {triangle {<0, 1, -1>, <0, -1, 1>, <0,  1,  1>}
    triangle {<0, 1, -1>, <0, -1, 1>, <0, -1, -1>}
   }

#declare Square_Y =  /* Scale-able plane in y */
  union 
   {triangle {<-1, 0, 1>, <1, 0, -1>, < 1, 0,  1>}
    triangle {<-1, 0, 1>, <1, 0, -1>, <-1, 0, -1>}
   }

#declare Square_Z =  /* Scale-able plane in z */
  union 
   {triangle {<-1, 1, 0>, <1, -1, 0>, <-1, -1, 0>}
    triangle {<-1, 1, 0>, <1, -1, 0>, < 1,  1, 0>}
   }

#version Shapes2_Inc_Temp;
#end
`,
    'shapes3.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

// Persistence of Vision Ray Tracer version 3.6 / 3.7 Include File
// file:   shapes3.inc
// author: Friedrich A. Lohmueller, March-2013
// 
// Update: Dec-2013 - Corrected wrong rotation in 'Round_Pyramid_N_in'. 
//
// Description: This file contains macros for working with object shapes,
// as well as macros for creating shapes of special geometric objects.
//    
// Segments of shapes
// #macro Segment_of_Object ( Segment_Object, Segment_Angle)
// #macro Segment_of_CylinderRing ( R_out, R_in, Height, Segment_Angle)
// #macro Segment_of_Torus ( R_major, R_minor, Segment_Angle)
//
// Angular shapes  
// #macro Column_N    (N, Radius_in, Height ) 
// #macro Column_N_AB (N, A, B, R_in)
// #macro Pyramid_N   (N, Radius_in_1, Radius_in_2, Height )
// #macro Pyramid_N_AB(N, A, R_in_A, B, R_in_B)             
// 
// Facetted shapes  
// #declare Egg  (uses #macro Egg_Shape) 
// #macro Facetted_Sphere (Quarter_Segments, Radial_Segments) 
// #macro Facetted_Egg_Shape (Quarter_Segments, Radial_Segments, Lower_Scale, Upper_Scale)
// #macro Facetted_Egg(N_Quarter_Segments, N_Radial_Segments) 
// 
// Round shape 
// #macro Egg_Shape (Lower_Scale, Upper_Scale) 
// 
// Wireframe shape  
// #macro Ring_Sphere (Rmaj_H, Rmaj_V, Rmin_H, Rmin_V, Number_of_Rings_horizontal, Number_of_Rings_vertical)
//
// Rounded shapes
// #macro Round_Pyramid_N_out (N, A, CornerR_out_A, B, CornerR_out_B, R_Border, Filled, Merge ) 
// #macro Round_Pyramid_N_in  (N, A, FaceR_in_A, B, FaceR_in_B, R_Border, Filled, Merge_On ) 
//
// #macro Round_Cylinder_Tube( A, B, R_major, R_minor, Filled, Merge)
// #macro Rounded_Tube( R_out, R_in, R_Border,  Height,  Merge)
// #macro Rounded_Tube_AB( A, B, R_out, R_in, R_Border, Merge)
//
// #macro Round_Conic_Torus( Center_Distance, R_upper, R_lower, R_Border, Merge)
// #macro Round_Conic_Prism( Center_Distance, R_upper, R_lower, Length_Zminus, R_Border, Merge) 
// #macro Half_Hollowed_Rounded_Cylinder1( Length, R_out, R_border, BorderScale, Merge)
// #macro Half_Hollowed_Rounded_Cylinder2( Length, R_out, R_corner, R_border, BorderScale, Merge)
// 
// #macro Round_N_Tube_Polygon (N, Tube_R, R_incircle, Edge_R, Filled, Merge)  
//  
//
// 
// 
// 
// --------------------------------------------------------

#ifndef( Shapes3_Inc_Temp)
#declare Shapes3_Inc_Temp = version;
#version 3.6; 

#ifdef(View_POV_Include_Stack)
   #debug "including shapes3.inc\\n"
#end   
 
#ifndef ( SHAPES_INC_TEMP) //Shapes_Inc_Temp)      
#include "shapes.inc"                                             
#end

#ifndef ( TRANSFORMS_INC_TEMP )
#include "transforms.inc"
#end 

#ifndef ( MATH_INC_TEMP )
#include "math.inc"
#end 

#ifndef ( STRINGS_INC_TEMP)
#include "strings.inc"
#end

// -----------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------
//-------------------------------------------------------------<<< macro Segment_of_Object() 
#macro  Segment_of_Object ( SEgment_OBject, Segment_Angle_)
// cuts out a segment of an shape object radial around y axis  
// starting with the +x direction 
// ----------------------------------------------------------------------------------  
#local D = 0.000001; // just a little bit
#local Segment_Angle = Segment_Angle_;

#if (Segment_Angle = 0) #local Segment_Angle = D; #end

#if (abs(Segment_Angle) >= 360) #local Segment_Angle = mod (Segment_Angle, 360); #end

#local O_min = min_extent ( SEgment_OBject );
#local O_max = max_extent ( SEgment_OBject );

#local O_max_x = max (O_min.x, O_max.x); 
#local O_max_z = max (O_min.z, O_max.z); 

#local R_max = 1.5*max(O_max_x,O_max_z);
  
#if (Segment_Angle > 0) 
   #local Box_z = R_max+D;  
#else 
   #local Box_z = -R_max+D; 
#end
 
 intersection{ 
  object{ SEgment_OBject }

  #if (abs(Segment_Angle) >= 180) 
  merge{
  #end // then use merge!

   box { <-R_max+D,O_min.y-D,0>,< R_max+D, O_max.y+D,-Box_z> 
         rotate<0,0,0> 
       }// end of box
 
   box { <-R_max+D,O_min.y-D, Box_z>,< R_max+D, O_max.y+D,0> 
         rotate<0, Segment_Angle,0> 
        }// end of box

  #if (abs(Segment_Angle) >= 180) 
   } // end of merge
  #end // end of merge, if merge is used!
  
} // end of intersection  

#end // end of macro -----------------------------------<<< end of macro Segment_of_Object() 
// -----------------------------------------------------------------------------------------
 


// -----------------------------------------------------------------------------------------
// ------------------------------------------------------<<< macro Segment_of_CylinderRing()
#macro  Segment_of_CylinderRing ( R_out, R_in, Height, Segment_Angle_)
// ------------------------------
#local D = 0.000001; // just a little bit

#local R_o = R_out; 
#local R_i = R_in; 
#local H = Height; 
#local Segment_Angle = Segment_Angle_; 


 #if (H = 0 ) #local  H = D; #end
 #if (H < 0 ) #local  D = -D; #end

 #if (R_o < R_i) #local X=R_o; #local R_o=R_i; #local R_i=X; #end
 #if (R_i <= 0) #local R_i = D; #end
 
 #if (Segment_Angle < 0) 
      #local Negativ_Flag = 1; 
      #local Segment_Angle = -Segment_Angle; 
 #else 
      #local Negativ_Flag = 0;
 #end
 

 #if (Segment_Angle >= 360) #local Segment_Angle = mod (Segment_Angle, 360); #end

 intersection{ 
   cylinder { <0,0,0>,<0,H,0>, R_o 
            } // end of outer cylinder  ----------
   cylinder { <0,-D,0>,<0,H+D,0>, R_i 
              inverse
            } // end of inner cylinder  ----------


  #if (Segment_Angle > 0) // ------------------------------------------------------
  #if (Segment_Angle >= 180)
  merge{
  #end // then use merge!

   box { <-R_o+D,-D,0>,< R_o+D, H+D, R_o+D> 
         rotate<0,0,0> 
       }// end of box
 
   box { <-R_o+D,-D,-R_o+D>,< R_o+D, H+D,0> 
         rotate<0,  Segment_Angle,0>  
       }// end of box

  #if (Segment_Angle >= 180)
   } // end of merge
  #end // end of merge, if merge is used!
  
 #if (Negativ_Flag = 1)  rotate<0,-Segment_Angle,0>   #end   
 scale<-1,1,-1> 
 #end // of "#if (Segment_Angle > 0)" --------------------------------------------

} // end of intersection  

#end // end of macro -----------------------------<<< end of macro Segment_of_CylinderRing()  
// -----------------------------------------------------------------------------------------

                                               
 
// -----------------------------------------------------------------------------------------
//--------------------------------------------------------------<<< macro Segment_of_Torus()
#macro Segment_of_Torus ( R_major_, R_minor_, Segment_Angle_)
//------------------------------------------------------------------------------------------
 #local D =  0.000001;
 #local R_major = R_major_;
 #local R_minor = R_minor_;
 #local Segment_Angle = Segment_Angle_;

 #if (Segment_Angle < 0) 
      #local Negativ_Flag = 1; 
      #local Segment_Angle = -Segment_Angle; 
 #else 
      #local Negativ_Flag = 0;
 #end

#if (Segment_Angle > 360) #local Segment_Angle = mod(Segment_Angle,360); #end
intersection{
 torus { R_major, R_minor sturm }

#if (Segment_Angle > 180)
 merge{
#end // use merge!

 box   { <-1,-1,0>,<1,1,1>
         scale < R_major+R_minor+D, R_minor+D, R_major+R_minor+D>
       }// end of box
 box   { <-1,-1,-1>,<1,1,0>
         scale < R_major+R_minor+D, R_minor+D, R_major+R_minor+D>
         rotate < 0,-Segment_Angle,0 >
       }// end of box

 #if (Segment_Angle > 180)
 }
 #end // end of merge, if merge is used!

 #if (Negativ_Flag = 0)  rotate<0,Segment_Angle,0>   #end 

 } // end of intersection

#end  // end of macro Torus_Segment( ... ) --------------<<< end of macro Segment_of_Torus()
// -----------------------------------------------------------------------------------------


//------------------------------------------------------------------------------ /////////
//----------------------------------------------------- Round_Tube_Polygon_N (...) macro
#macro Round_N_Tube_Polygon( // A round polygon tube ring with N corners, filled or not!
                             N_in, // number of corners
                             Tube_R_in, // tube radius
                             Base_Width_in, // R_incircle (center to edge middle)
                             Corner_R_in, //  corner torus segment major radius
                             Filled, // 1 = filled, 0 = ring, filling percentage
                             Merge_On // 0 = union, 1 = merge

                           ) //-----------------------------------------------
//---------------------------------------------------------------------------
#local D = 0.000001; // just a little bit
//---------------------------------------------------------------------------
// check inputs:
#local Corner_R = abs(Corner_R_in);
#local Base_Width = abs(Base_Width_in);
#if (Corner_R > Base_Width)
    #local Corner_R=Base_Width;
    #debug concat( "Attention: Corner radius > base width. Set corner radius = base width !","\\n")
#end

#local N = N_in;
#if (int(N) != N ) #local N = int(N);
    #debug concat( "Attention: Number of corners should be an integer!","\\n")
    #debug concat( "           Number of corners set to int(number of corners)","\\n")
#end
#if (N < 3 ) #local N = 3;
    #debug concat( "Attention: Number of corners should be > 3. Set mumber of corners to 3 !","\\n")
#end

#local Tube_R  = Tube_R_in;
#if (Tube_R <= 0 )
  #if (abs(Tube_R)<= 0.00001 )
  #local Tube_R    = 0.00001;
  #else
  #local Tube_R = abs(Tube_R);
  #end
  #debug concat( "Attention: Tube radius should > 0.00001. Tube radius set to max( abs(tube radius), 0.00001) !","\\n")
  #debug concat( "           This could be unvisible in this scene !","\\n")
#end
// --------------------------------------------------------------------------
#local Edge_Angle = 360/N ;
#local Linear_Half_Len = (Base_Width-Corner_R)*tan(radians(Edge_Angle/2));

//---------------------------------------------------------------------------
#local Edge_Part =
#if( Filled > 0)
 #if( Merge_On = 1 )
 merge{
 #else
 union{
 #end // #if(Merge_On = 1 )
#end // #if(Filled > 0)

object{ Segment_of_Torus( Corner_R, Tube_R, -Edge_Angle)
        rotate<-90,0,0> translate<Base_Width-Corner_R,Linear_Half_Len,0>
      } // end of Torus_Segment(...)

#if( Filled > 0)
cylinder{ <0,0,-Tube_R*Filled>,<0,0,Tube_R*Filled>, Corner_R
          translate<Base_Width-Corner_R,Linear_Half_Len,0>
        }

}// end union or merge
#end // #if(Filled > 0)

//---------------------------------------------------------------------------
#if (Corner_R != Base_Width)


#local Linear_Part =
#if( Filled > 0)
 #if( Merge_On = 1 )
 merge{
 #else
 union{
 #end // #if(Merge_On = 1 )
#end // #if(Filled > 0)

cylinder { <0,-Linear_Half_Len-D,0>,<0,Linear_Half_Len+D,0>,Tube_R
           scale <1,1,1> rotate<0,0,0> translate<Base_Width,0,0>
         } // end of cylinder


#if( Filled > 0)
// linear prism in z-direction: from ,to ,number of points (first = last)
prism{ -Tube_R*Filled-D ,Tube_R*Filled+D , 6
       <-D, 0.00>,  // first point
       < Base_Width-Corner_R-D,-Linear_Half_Len-D>,
       < Base_Width           ,-Linear_Half_Len-D>,
       < Base_Width           , Linear_Half_Len+D>,
       < Base_Width-Corner_R-D, Linear_Half_Len+D>,
       <-D, 0.00>  // last point = first point!!!!
       rotate<-90,0,0> scale<1,1,-1> //turns prism in z direction! Don't change this line!
     } // end of prism --------------------------------------------------------

}// end union or merge
#end // #if(Filled_On = 1)


#end // #if (Corner_R != Base_Width)
//---------------------------------------------------------------------------

#if (Corner_R != Base_Width)
#local One_Segment =
 #if(Merge_On = 1 )
 merge{
 #else
 union{
 #end
        object {Linear_Part}
        object {Edge_Part}
        translate<0,0,0>
     } // end union or merge
#else
 #local One_Segment =
        object {Edge_Part}
#end
//---------------------------------------------------------------------------
// final union or merge
#if(Merge_On = 1 )
merge{
#else
union{
#end

  #local Nr = 0;     // start
  #local EndNr = N; // end
  #while (Nr< EndNr)
    object{One_Segment rotate<0,0,Nr * 360/EndNr>}

  #local Nr = Nr + 1;    // next Nr
  #end // ---------------  end of loop
} // end union or merge

// --------------------------------------------------------------------------------------
#end// of macro ------------------------------------------------------// end of macro
// -----------------------------------------------------------------------------------------

 
// -----------------------------------------------------------------------------------------
// --------------------------------------------------------------------<<< macro Pyramid_N()
#macro Pyramid_N (N, Radius1, Radius2, Height ) 
// ----------------------------------------------------------------------------- 
#local D= 0.000001; // a little bit to avoid coincident surfaces in intersection

intersection{
 #local Nr = 0;    // start
 #local EndNr = N; // end
 #while (Nr< EndNr) 
   
  // linear prism in z-direction: from ,to ,number of points (first = last)
  prism { -2.00 ,2.00 , 5
         <-2.00, 0.00-Nr*D>,
         < 1.00,0.00-Nr*D>,
         < 0.00+Radius2/Radius1,1.00+Nr*D>,
         <-2.00,1.00+Nr*D>,
         <-2.00,0.00-Nr*D>
         rotate<-90,0,0> scale<1,1,-1> //turns prism in z direction! 
         scale<Radius1+Nr*D,Height+Nr*D,Radius1+Nr*D>
         rotate<0,Nr * 360/EndNr,0>
     } // end of prism -------------------------------------------------------------

 #local Nr = Nr + 1;    // next Nr
 #end // ----------------  end of loop 
} // end of intersection

#end // ---------------------------<<< end of macro Pyramid_N (N, Radius1, Radius2, Height ) 
// -----------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------
// -----------------------------------------------------------------<<< macro Pyramid_N_AB()
#macro Pyramid_N_AB (N, Point_A, Radius_A, Point_B, Radius_B ) 
// ----------------------------------------------------------------------------- 
#local A = Point_A; 
#local B = Point_B; 
#local AB = B-A;  
#local H  = vlength( AB); // pyramid height;

object{ Pyramid_N ( N, Radius_A, Radius_B, H ) 
        Reorient_Trans(< 0,1,0>, AB ) // needs "transforms.inc":
        translate A 
      }  //
#end // -------------<<< end of macro Pyramid_N_AB(N, Point_A, Radius_A, Point_B, Radius_B ) 
// -----------------------------------------------------------------------------------------


// --------------------------------------------------------------------<<< macro Column_N()
#macro Column_N  (N, Radius, Height ) 
//------------------------------------------------------------------
object{ Pyramid_N (N, Radius, Radius, Height )
      }
#end // -------------------------------------<<< end of  macro N_Column (N, Radius, Height )
// -----------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------
// -----------------------------------------------------------------<<< macro Column_N_AB()
#macro Column_N_AB (N, Point_A, Point_B, Radius ) 
// ----------------------------------------------------------------------------- 
#local A = Point_A; 
#local B = Point_B; 
#local AB = B-A;  
#local H  = vlength( AB); // pyramid height;

object{ Pyramid_N ( N, Radius, Radius, H ) 
        Reorient_Trans(< 0,1,0>, AB ) // needs "transforms.inc":
        translate A 
      }  //
#end // --------------------------<<< end of macro Column_N_AB(N, Point_A, Point_B, Radius ) 
// -----------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------
// --------------------------------------------------------------------<<< macro Egg_Shape() 
#macro Egg_Shape (Lower_Scale, Upper_Scale)                  // 
// ------------------------------------------------------------
#local Egg_Lower_Part =
         difference {
                      sphere{<0,0,0>,1 scale<1,Lower_Scale,1>}
                      box{<-1,0,-1>,<1,Lower_Scale,1>}
                    } //---------------------------------------
#local Egg_Upper_Part =
         difference {
                      sphere {<0,0,0>,1 scale<1,Upper_Scale,1>}
                      box {<-1,-Upper_Scale,-1>,<1,0,1>}
                     }//---------------------------------------
//-------------------------------------------------------------
  merge { 
          object {Egg_Upper_Part}
          object {Egg_Lower_Part}
          translate<0,Lower_Scale,0>
          scale 2/(Lower_Scale+Upper_Scale) 
           
        } // end of merge ------------------------------------
#end //---------------------------------------------------------<<< end of macro Egg_Shape()
// -----------------------------------------------------------------------------------------


// -------------------------------------------------------- shape of simple egg: object Egg
#declare Egg = object { Egg_Shape (1.15,1.55)} 
// ---------------------------------------------------------------<<< end of the object Egg


// -----------------------------------------------------------------------------------------
// --------------------------------------------------------------<<< macro Facetted_Sphere()
#macro Facetted_Sphere (Quarter_Meridian_Segments, Equatorial_Segments)

#local Facets_Silhouette =
 prism { 
   -2 ,2 , 
   2*Quarter_Meridian_Segments+4
   < -2,-1.00>, 

   #local Nr    = -Quarter_Meridian_Segments; 
   #local EndNr =  Quarter_Meridian_Segments;
   #while (Nr< EndNr+1)
     #local Angle_degrees = Nr* 90/EndNr;
     #local Angle_radians = radians(Angle_degrees);
   < cos(Angle_radians) , sin(Angle_radians)>,
     
   #local Nr = Nr + 1 ;     
   #end       
   < -2, 1>,
   < -2,-1> 
      
 rotate<-90,0,0> scale<1,1,-1> //turns prism in z direction!  
 } // end of prism object ---------------------------------- 

intersection{
 #local Nr = 0;                  // start
 #local EndNr = Equatorial_Segments; // end
 #while (Nr< EndNr) 
 
 object{ Facets_Silhouette rotate<0,Nr * 360/EndNr,0>} 

 #local Nr = Nr + 1;    // next Nr
 #end // ---------------  end of loop 

} // end of intersection

#end // --------------------------------------------------<<< end of macro Facetted_Sphere()
// -----------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------
// -----------------------------------------------------------<<< macro Facetted_Egg_Shape()
#macro Facetted_Egg_Shape (Quarter_Segments, Radial_Segments, Lower_Scale, Upper_Scale)
     //Facettierte_Kugel (Viertelskreis_Teilung, Radial_Teilung)
#local Facets_Silhouette =
union{
 prism { 
   -2 ,2 ,  Quarter_Segments +4
   < -2,-1.00>, 
 #local Nr    =  -Quarter_Segments; 
 #local EndNr =  0;
 #while (Nr< EndNr+1)
   #local Angle_degrees = Nr* 90/Quarter_Segments;
   #local Angle_radians = radians(Angle_degrees);
   < cos (Angle_radians) , sin (Angle_radians)> ,
 #local Nr = Nr + 1 ;     
 #end       
   < -2, 0>, 
   < -2,-1.00> 
 rotate<-90,0,0> scale<1,1,-1> //turns prism in z direction! Don't change this line! 
 scale<1,Lower_Scale,1>
 } // end of prism object ----------------------------------------------------------

 prism { 
  -2 ,2 , Quarter_Segments+4
  < -2, 0>, 
  #local Nr    =  0; 
  #local EndNr =  Quarter_Segments;
  #while (Nr< EndNr+1)
   #local Angle_degrees = Nr* 90/Quarter_Segments;
   #local Angle_radians = radians(Angle_degrees);
  < cos (Angle_radians) , sin (Angle_radians)> ,
  #local Nr = Nr + 1 ;     
  #end       
  < -2, 1>,
  < -2, 0> 
 rotate<-90,0,0> scale<1,1,-1> //turns prism in z direction! 
 scale<1,Upper_Scale,1>
 } // end of prism object -------------------------------------------
}// end of union

intersection{
 #local Nr = 0;                  // start
 #local EndNr = Radial_Segments; // end
 #while (Nr< EndNr) 
 
 object{ Facets_Silhouette rotate<0,Nr * 360/EndNr,0>} 

 #local Nr = Nr + 1;    // next Nr
 #end // ---------------  end of loop 
} // end of intersection

#end // ----------------------------------------------------<<<< end of macro Facetted_Egg() 
// -----------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------
// -----------------------------------------------------------------<<< macro Facetted_Egg()
#macro Facetted_Egg(N_Quarter_Segments, N_Radial_Segments) 
  object{ Facetted_Egg_Shape(N_Quarter_Segments, N_Radial_Segments, 1.15, 1.55)
          translate < 0, 1.15, 0>
          scale 2/(1.15 + 1.55)
         }
#end                                                                                   
//------------------------------------------------------------<<<end of macro Facetted_Egg()
// -----------------------------------------------------------------------------------------
  

// -----------------------------------------------------------------------------------------
// ------------------------------------------------------------------<<< macro Ring_Sphere()
//Sphere with latitudes by steps in degrees - globus 
#macro Ring_Sphere( Rmaj_H, Rmaj_V, Rmin_H, Rmin_V, 
                    Number_of_Rings_horizontal, Number_of_Rings_vertical)

#if( (Rmin_H > 0) & (Number_of_Rings_horizontal > 0))
#local RingsH1 = 
union{
#local AngleD = 180/ (Number_of_Rings_horizontal+1);
#local Nr = -90+AngleD; #local EndNr = 90; // --- start and end
// Nr = value of the angle 

#while (Nr< EndNr)
 #local RingR = Rmaj_H*cos(radians(Nr)); //sqrt( pow(R0,2) - pow((Nr*HDiff),2) );
 #local RingH = Rmaj_H*sin(radians(Nr));
 torus{RingR,Rmin_H scale <1,1,1>
       rotate<0,0,0>
       translate<0, RingH,0>} 
#local Nr = Nr + AngleD;
#end // --------------- end of loop 
} // -----------------
#end // of "#if ( (Rmin_H > 0) & (Number_of_Rings_horizontal > 0))"

#if ((Rmin_V > 0) &(Number_of_Rings_vertical > 0))
#local RingsV1 =          // longitudes 
union{
#local Nr = 0; #local EndNr = Number_of_Rings_vertical; // --- start and end
#while (Nr< EndNr)
 torus{Rmaj_V-Rmin_V,Rmin_V scale <1,1,1>
       rotate<90,0,0>
       rotate<0, Nr*360/EndNr,0>} 
#local Nr = Nr + 1;
#end // --------------- end of loop 
} // ---------------------------------
#end // of "#if ((Rmin_V > 0) &(Number_of_Rings_vertical > 0))"

union{ #if ((Rmin_H > 0) & (Number_of_Rings_horizontal > 0)) object{ RingsH1} #end
       #if ((Rmin_V > 0) & (Number_of_Rings_vertical   > 0)) object{ RingsV1} #end
       sphere{<0, Rmaj_H,0>,Rmin_H} 
       sphere{<0,-Rmaj_H,0>,Rmin_H} 
     }  
#end // ------------------------------------------------------<<< end of macro Ring_Sphere()
// -----------------------------------------------------------------------------------------
 

// -----------------------------------------------------------------------------------------
// ---------------------------------------------------------<<<   macro Round_Pyramid_N_in()
#macro Round_Pyramid_N_in ( // radius of the incircle radius
            Number_of_Sidefaces, // >=3 
            Point_A, Radius_A_in, Point_B, Radius_B_in,// radii of edge middles (R_in_A,R_in_B) 
            Wire_Radius, //  border radius (Fill_On = 1) or wire radius ( Fill_On = 0 )
            Fill_On,     //  1 = filled, 0 = wireframe,
            Merge_On     //  1 = use merge, 0 = use union
          ) // -------------------------------------------------   
// -------------------------------------------
// calculating the radius of the circumcircle: 
#local Half_Angle = 180/Number_of_Sidefaces;
#local R_out_A = Radius_A_in*sqrt( 1 + pow(tan(radians(Half_Angle)),2) ) ; 
#local R_out_B = Radius_B_in*sqrt( 1 + pow(tan(radians(Half_Angle)),2) ) ; 
// ------------------------------------------------------------- 
object{ Round_Pyramid_N_out ( // used radius of the circumcircle 
            Number_of_Sidefaces, // >=3 
            Point_A, R_out_A , Point_B, R_out_B,// radii of corner points (R_out_A,R_out_B) 
            Wire_Radius, //  border radius (Fill_On = 1) or wire radius ( Fill_On = 0 )
            Fill_On,     //  1 = filled, 0 = wireframe,
            Merge_On     //  1 = use merge, 0 = use union
          ) // -------------------------------------------------   
  //
translate -Point_A
Axis_Rotate_Trans(  Point_B-  Point_A ,Half_Angle) 
translate  Point_A
} // end of object
#end// -----------------------------------------------<<<  end of macro Round_Pyramid_N_in()
// -----------------------------------------------------------------------------------------
 
// -----------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------
// --------------------------------------------------------<<<   macro Round_Pyramid_N_out()
#macro Round_Pyramid_N_out ( // used radius of the circumcircle 
            Number_of_Sidefaces, // >=3 
            Point_A, Radius_A, Point_B, Radius_B,// radii of corner points (R_out_A,R_out_B) 
            Wire_Radius, //  border radius (Fill_On = 1) or wire radius ( Fill_On = 0 )
            Fill_On,     //  1 = filled, 0 = wireframe,
            Merge_On     //  1 = use merge, 0 = use union
          ) // -----------------------------------------------------------------------------  
#local D = 0.000001;
#local N  = Number_of_Sidefaces; 
#local Rw = Wire_Radius; 

#local A  = Point_A;  
#local B  = Point_B;  
#local AB = B-A;  

#local Rc1= Radius_A-Rw; // base corner radius 
#local Rc2= Radius_B-Rw; // top  corner radius
#local H  = vlength( AB)-2*Rw;  // Pyramid_Height;

#if ( H <= 0 ) // ---------------------------
#debug "Warning: H must be > 0 "
#local H = 0 ;
#end // ----------------------------------------
 
#local D = 0.000001;    
#if ( N < 3) #local N = 3; #end // 3 is minimum!!!
#if ( Rw = 0 ) #local Rw = D; #end  
#if ( Rw < 0 ) #local Rw = abs(Rw) ; #end
#if ( Rc1 < 0 ) #local Rc1 = abs(Rc1) ; #end
#if ( Rc2 < 0 ) #local Rc2 = abs(Rc2) ; #end
// ---------------------------------------------------------------------------------------------------
#local Flip = 0;       
#if ( Rc1 < Rc2 ) #local Delta_Xchange = Rc1; #local Rc1 = Rc2; #local Rc2 = Delta_Xchange; 
#local Flip = 1;       
#end // --------
// ---------------------------------------------------------------------------------------------------
// radii to middle of the horizontal edges
#local Re1 = Rc1*cos(radians(180/N));
#local Re2 = Rc2*cos(radians(180/N));
// length of the hor. edges: 
#local HLe1 = Rc1*sin(radians(180/N)); // half length of base edge
#local HLe2 = Rc2*sin(radians(180/N)); // half length of top edge
//
#local P_Angle = degrees(atan2( H, (Re1-Re2))); // pending sides angle against vertical !!
// -----------------------------------------------------------
// wire radius depending relevant values
#local Rw_sin = Rw*sin(radians(P_Angle)); // side difference
#local Rw_cos = Rw*cos(radians(P_Angle)); // height diffence
//----------------------------------------------------------------------

//  wireframe + filling ------------------------------------------------ global union
#if (Merge_On = 1)   
merge{
#else
union{ // I 
#end // of #if (Merge_On = 1) .............    

 //---------------------------- Wireframe
 #if (Rc1 = 0 )
  sphere{< 0, H, 0>,Rw } // only one base sphere 
 #end 
 #if (Rc2 = 0 )
  sphere{< 0, H, 0>,Rw } // only one top sphere 
 #end 
 
 #local Nr = 0; 
 #while (Nr< N) 
 
   #if (Merge_On = 1) // Ia
   merge{
   #else
   union{
   #end // of "#if (Merge_On = 1)"
       #if (Rc1 != 0 ) // else no base spheres  and  no base ring cylinders
       sphere{< Rc1, 0, 0>,Rw} // base corner
       cylinder {< 0, 0, -HLe1>, < 0, 0,  HLe1>,Rw translate<Re1,0,0> rotate<0,-180/N,0 > } // lower sides hor.ring
       #end
     #if (H > 0)
       #if (Rc2 != 0 ) // else no top sphere and no base ring cylinders
       sphere{< Rc2, H, 0>,Rw} // top  corner
       cylinder {< 0, 0, -HLe2>, < 0, 0,  HLe2>,Rw translate<Re2,H,0> rotate<0,-180/N,0 > } // upper sides hor.ring
       #end 
       cylinder {< Rc1, 0, 0>,< Rc2, H, 0>,Rw }    // side edge base to top 
     #end 
       rotate<0,Nr*360/N,0>
   } // end of union or merge  // Ia
 
 #local Nr = Nr + 1;
 #end  // -------------------------- end of wire frame

// ---------------------------------------------------
#if (Fill_On = 1)  // ------------------------ filling

#if (Merge_On = 1)
 merge{ //II
#else
 union{ //II
#end // of "#if (Merge_On = 1)"

 #local Nr = 0; 
 #while (Nr< N) 

   #if (Merge_On = 1)
   merge{ //III
   #else
   union{ //III
   #end // of "#if (Merge_On = 1)"

 intersection{    
   prism{ -Rw ,H+Rw  , 4   // prism y
           < Rw_sin+D    ,    0>,
           < Re1+Rw_sin+D, HLe1>,
           < Re1+Rw_sin+D,-HLe1>,
           < Rw_sin+D    ,    0>
        } // end of prism in y --------
   prism{ -Rc1-D , Rc1+D, 5 // prism z   
           < 0            ,   Rw_cos>,   
           < Re1+Rw_sin   ,   Rw_cos>,
           < Re2+Rw_sin   , H+Rw_cos>,
           < 0            , H+Rw_cos>, 
           < 0            ,   Rw_cos>  
          rotate<-90,0,0> scale<1,1,-1>  
        } // end of prism ---------------
   rotate<0,-180/N,0>
   rotate<0,-Nr*360/N,0>
 }// end of intersection
 
 // inner between fillers, center to the corners: 
 prism{ -Rw_sin-D , Rw_sin+D, 5 // prism z 
                   < -D           ,Rw_cos -D>,
                   <  Rc1         ,Rw_cos -D>,
                   <  Rc2         ,Rw_cos +H +D>,
                   <-D            ,Rw_cos +H +D>,
                   <-D            ,Rw_cos -D>
          rotate<-90,0,0> scale<1,1,-1> rotate<0,360/N/2,0>  
          rotate<0,-360/N/2 ,0>
  rotate<0,-(Nr)*360/N,0>        
          } // end of prism -------------------------------------

  }//  end union/merge III

 #local Nr = Nr + 1;
 #end  

 // fillers cover and top ---------------------------------------
 intersection{  // lower cover  
  #local Nr = 0; 
  #while (Nr< N) 
        box{  <-1.5*Rc1,-Rw-D*Nr,-Rc1-Rw_sin>, <Re1 ,Rw_cos+D+D*Nr, Rc1+Rw_sin> 
        rotate<0,(Nr+0.5)*360/N,0>}
 #local Nr = Nr + 1;
 #end  
 }// end of intersection

 intersection{   // upper cover 
  #local Nr = 0; 
  #while (Nr< N) 
      box{<-1.5*Rc1,H-Rw,-Rc1>,<Re2,H+Rw-D*Nr, Rc1> 
        rotate<0,(Nr+0.5)*360/N,0>}
 #local Nr = Nr + 1;
 #end  
 }// end of intersection
}// end of union or merge // II
#end // of (Fill_On = 1) ---------- end of filling

translate<0,Rw,0>
 
#if (Flip = 1)
scale<1,-1,1> translate<0,H+2*Rw,0> 
#end 
 

Reorient_Trans(< 0,1,0>, AB ) // needs "transforms.inc":
translate A 
                            
} // end of global union
#end// ----------------------------------------------<<<  end of macro Round_Pyramid_N_out()
// -----------------------------------------------------------------------------------------
 


// -----------------------------------------------------------------<<< macro Rounded_Tube() 
#macro Rounded_Tube ( Tube_R_out__, // Tube radius outside
                      Tube_R_in__,  // Tube inner radius 
                      Border_R__,   // border radius 
                      Tube_Y__,     // tube high
                      Merge_, // 0 = union, 1 = merge
                    ) //----------------------------------------------------  
// ------------------------------------------------------------------------- 
#local D = 0.000001;     /// *Border_R__                  

#local Tube_R_out_ =  Tube_R_out__; 
#local Tube_R_in_ = Tube_R_in__; 
#local Border_R_ = Border_R__; 
#local Tube_Y_ = Tube_Y__;

// inner radius bigger than outer radius - exchange them
#if (Tube_R_in_ > Tube_R_out_)
    #local Temporary_ = Tube_R_out_; 
    #local Tube_R_out_ = Tube_R_in_;
    #local Tube_R_in_ = Temporary_;
    #warning concat("\\nTube inner radius > tube inner radius! \\n Radii exchanged!")
#end
// too big border radii: reduce border radii.
#if ( Border_R_ >= min((Tube_Y_/2),(Tube_R_out_-Tube_R_in_) )) 
    #local Border_R_ = min((Tube_Y_/2),(Tube_R_out_-Tube_R_in_))-D; 
    #warning concat("\\nTube height < 2*border radius! or 
 Difference of outer radius - inner radius <  2*border radius! 
 Border radius reduced!")
#end  

#if (Merge_ = 1 )  
merge{ 
#else
union { 
#end
   difference{ // outline
    cylinder{<0,+Border_R_,0>,<0,Tube_Y_-Border_R_,0>,Tube_R_out_ } 
    cylinder{<0,-D        ,0>,<0,Tube_Y_+D,        0>,Tube_R_in_  } 
   } // end of difference
   difference{ // tween
    cylinder{<0,0, 0>,<0,Tube_Y_  ,0>,Tube_R_out_-Border_R_} 
    cylinder{<0,-D,0>,<0,Tube_Y_+D,0>,Tube_R_in_ +Border_R_} 
   } // end of difference

   torus{ Tube_R_out_-Border_R_, Border_R_ translate<0,Tube_Y_-Border_R_-D,0>}  
   torus{ Tube_R_out_-Border_R_, Border_R_ translate<0,0+Border_R_+D,0>}  
   torus{ Tube_R_in_ +Border_R_, Border_R_ translate<0,Tube_Y_-Border_R_-D,0>}  
   torus{ Tube_R_in_ +Border_R_, Border_R_ translate<0,0+Border_R_+D,0>}  
} // end of merge or union 
#end// of macro --------------------------------------------<<<  end of macro Rounded_Tube()
// -----------------------------------------------------------------------------------------


// --------------------------------------------------------------<<< macro Rounded_Tube_AB()
#macro Rounded_Tube_AB ( Point_A, Point_B, Radius_out, Radius_in, Border_Radius, Merge) 
// --------------------------------------------------------------  
#local A = Point_A; 
#local B = Point_B; 
#local AB = B-A;  
#local H  = vlength( AB); // pyramid height;

object{ Rounded_Tube ( Radius_out, Radius_in, Border_Radius, H, Merge ) 
        Reorient_Trans(< 0,1,0>, AB ) // needs "transforms.inc":
        translate A 
      }  //
#end // ------------<<< end of macro Rounded_Tube_AB(N, A, B, R_out, R_in, R_Border, Merge ) 
// -----------------------------------------------------------------------------------------



// ----------------------------------------------------------<<< macro Round_Cylinder_Tube()
#macro Round_Cylinder_Tube ( A, // starting point
                             B, // end point
                             Radius,     // major radius
                             EdgeRadius, // minor radius
                             Filled, // if Filled = 1;  otherwise: open tube
                             UseMerge // use merge for transparent materials
                           ) //--------------------------------------------- 
//-------------------------------------------------------------------------- 
#local D = 0.00001;

#if( Filled = 0 )
difference{
#end

#if( UseMerge = 1 )
   merge {
#else
   union {
#end

  #if( Radius<EdgeRadius ) // degenerated case
     #warning "\\nRound_Cylinder() macro called with Radius < EdgeRadius,\\nresults may not be as expected\\n"
     #local AA = A + vnormalize(B - A)*Radius;
     #local BB = B + vnormalize(A - B)*Radius;

    cylinder {AA, BB, Radius}
    sphere {0, Radius translate AA }
    sphere {0, Radius translate BB }

  #else // non-degenerated case

     #local AA = A + vnormalize(B - A)*EdgeRadius;
     #local BB = B + vnormalize(A - B)*EdgeRadius;

     #if( Filled = 1 )
     cylinder {A, B, Radius - EdgeRadius}
     #end

     cylinder {AA, BB, Radius}
     torus {Radius - EdgeRadius, EdgeRadius translate y*EdgeRadius
            Point_At_Trans(B - A)
            translate A
           }
     torus {Radius - EdgeRadius, EdgeRadius translate y*(vlength(A - B) - EdgeRadius)
            Point_At_Trans(B - A)
            translate A
           }
  #end // end of degenerated by radius or not
  } // end of union or merge

 #if( Filled = 0)  // A+D*(A-B), B+D*(B-A)
 cylinder {A, B, Radius - 2*EdgeRadius}
}// end of difference
#end // of "#if( Filled = 0 )"

#end// of macro --------------------------------------<<< end of macro Round_Cylinder_Tube()
// -----------------------------------------------------------------------------------------

//-------------------------------------------------------------<<< macro Round_Conic_Torus() 
#macro Round_Conic_Torus( C_distance_,// >0, vertical center distance of upper + lower torii
                          R_upper_,  // >0, upper radius up by <0,C_distance,0>
                          R_lower_,  // >0, lower radius on zero !!!
                          Border_R_, // max. = min(R_lower,R_upper)
                          Merge_On
                        ) //-------  looks in y+direction
//------------------------------------------------------------------
#local D = 0.000001; // just a little bit !!!
//------------------------------------------
#local C_distance = C_distance_; 
#local R_upper = R_upper_;
#local R_lower = R_lower_; 
#local Border_R = Border_R_; 
//------------------------------------------
#if (C_distance = 0) #local C_distance = D;
 #warning "\\nRound_Conic_Torus() macro called with center distance = 0,\\n center distance set to 0.000001 ! \\n"
#end
#if (C_distance < 0) #local C_distance = abs(C_distance);
 #warning "\\nRound_Conic_Torus() macro called with center distance < 0,\\n center distance set to abs(center distance) ! \\n"
#end

#if (Border_R < 0 ) #local Border_R = abs(  Border_R );
 #warning "\\nRound_Conic_Torus() macro called with border radius < 0,\\n border radius set to abs(border radius) ! \\n"
#end
#if (Border_R = 0 ) #local Border_R = 0.01;
 #warning "\\nRound_Conic_Torus() macro called with border radius = 0,\\n border radius set to 0.001 ! \\n"
#end
#if (Border_R >  min(R_lower,R_upper) ) #local Border_R = min(R_lower,R_upper)+D;
 #warning "\\nRound_Conic_Torus() macro called with border radius > min(lower radius, upper radius),\\n border radius set to  min(lower radius, upper radius) + 0.000001 ! \\n"
#end


#if (R_upper = 0) #local R_upper =  0.002;
 #warning "\\nRound_Conic_Torus() macro called with upper radius = 0,\\n upper radius set to 0.002 ! \\n"
#end
#if (R_upper < 0) #local R_upper = abs (R_upper);
 #warning "\\nRound_Conic_Torus() macro called with upper radius < 0,\\n upper radius set to  abs(upper radius) ! \\n"
#end
#if (R_lower = 0) #local R_lower = 0.002;
 #warning "\\nRound_Conic_Torus() macro called with lower radius = 0,\\n lower radius set to 0.002 ! \\n"
#end
#if (R_lower < 0) #local R_lower = abs (R_upper);
 #warning "\\nRound_Conic_Torus() macro called with lower radius < 0,\\n lower radius set to  abs(lower radius) ! \\n"
#end
//---------------------------------------------------------------------------------------------------
// exchange upper and lower for construction if necessary (later they will changed back!)
#if ( (R_upper >= R_lower) & (C_distance>0)) #local Ro = R_upper; #local Ru = R_lower; #local Flag=0;
#else                                        #local Ro = R_lower; #local Ru = R_upper; #local Flag=1;
#end
//------------------------------------------------------
#local Side_Len   = sqrt(pow(C_distance,2) - pow( (Ro-Ru),2) );
#local Side_Angle = degrees( atan( (Ro-Ru)/ Side_Len) );


#if ( Merge_On = 1 ) union{
#else                merge{   #end
 // +z /-z border cylinder pending
 cylinder{< 0,0,-D>,<0,Side_Len,0>,Border_R translate<0,0,Ru> rotate< Side_Angle,0,0>}
 cylinder{< 0,0,-D>,<0,Side_Len,0>,Border_R translate<0,0,Ru> rotate< Side_Angle,0,0> scale<1,1,-1>}

intersection{ // +z box pending
 torus{ Ru, Border_R rotate<0,0,90> translate<0,0,0>}
 box{< -Border_R-D,0,-Ru-Border_R-D>,<Border_R+D,Ru+Border_R+D,Ru+Border_R+D> rotate< Side_Angle,0,0> inverse}
 box{< -Border_R-D,0,-Ru-Border_R-D>,<Border_R+D,Ru+Border_R+D,Ru+Border_R+D> rotate<-Side_Angle,0,0> inverse}
}// end inters

intersection{ // +z box pending
//union{
 torus{ Ro, Border_R rotate<0,0,90> translate<0,C_distance,0>}
 intersection{
 box{< -Border_R-D,-Ro-Border_R-D,-Ro-Border_R-D>,<Border_R+D,0,Ro+Border_R+D> rotate< Side_Angle,0,0> }
 box{< -Border_R-D,-Ro-Border_R-D,-Ro-Border_R-D>,<Border_R+D,0,Ro+Border_R+D> rotate<-Side_Angle,0,0> } 
 translate<0,C_distance,0> inverse}
}// end inters

//#end // of "#if ( Border_R > 0 )"
#if (Flag = 1) scale<1,-1,1> translate<0,C_distance,0> #end
rotate<0,90,0> // turn it in the xy-plane
 } //end of union

#end// of macro ---------------------------------------<<<  end of macro Round_Conic_Torus()
// -----------------------------------------------------------------------------------------

// ------------------------------------------------------------<<< macro Round_Conic_Prism()
#macro Round_Conic_Prism( C_distance_,  // >0, vertical center distance of the upper and lower torii
                          R_upper_,  // >0, upper radius up by <0,C_distance,0>
                          R_lower_,  // >0, lower radius on zero !!!
                          Len_,  // length in z-
                          Border_R_, //max. = min(R_lower,R_upper) 0 = without rounded borders
                          Merge_On
                        ) //-------  looks in y+direction
// -----------------------------------------------------------------------------------------
#local D = 0.000001; // just a little bit !!!
// ------------------------------------------
#local C_distance = C_distance_; 
#local R_upper = R_upper_;
#local R_lower = R_lower_; 
#local Len = Len_; 
#local Border_R = Border_R_; 
// ------------------------------------------

#if (C_distance = 0) #local C_distance =  0.001;
 #warning "\\nRound_Conic_Prism() macro called with center distance = 0,\\n center distance set to 0.000001 ! \\n"
#end
#if (C_distance < 0) #local C_distance = abs(C_distance);
 #warning "\\nRound_Conic_Prism() macro called with center distance < 0,\\n center distance set to abs(center distance) ! \\n"
#end

#if (Border_R < 0 ) #local Border_R = abs(  Border_R );
 #warning "\\nRound_Conic_Prism() macro called with border radius < 0,\\n border radius set to abs(border radius) ! \\n"
#end
#if (Border_R = 0 ) // #local Border_R = 0.01;
// #warning "\\nRound_Conic_Torus() macro called with border radius = 0,\\n border radius set to 0.001 ! \\n"
#end
#if (Border_R >  min(R_lower,R_upper) ) #local Border_R = min(R_lower,R_upper)+D;
 #warning "\\nRound_Conic_Prism() macro called with border radius > min(lower radius, upper radius),\\n border radius set to  min(lower radius, upper radius) + 0.000001 ! \\n"
#end


#if (R_upper = 0) #local R_upper =  0.0005;
 #warning "\\nRound_Conic_Prism() macro called with upper radius = 0,\\n upper radius set to 0.0005 ! \\n"
#end
#if (R_upper < 0) #local R_upper = abs (R_upper);
 #warning "\\nRound_Conic_Prism() macro called with upper radius < 0,\\n upper radius set to  abs(upper radius) ! \\n"
#end
#if (R_lower = 0) #local R_lower = 0.0001;
 #warning "\\nRound_Conic_Prism() macro called with lower radius = 0,\\n lower radius set to 0.0001 ! \\n"
#end
#if (R_lower < 0) #local R_lower = abs (R_upper);
 #warning "\\nRound_Conic_Prism() macro called with lower radius < 0,\\n lower radius set to  abs(lower radius) ! \\n"
#end


#if (Len < 0)   #local Len = abs(Len);
 #warning "\\nRound_Conic_Prism() macro called with length in z+ = 0,\\n length set to abs(length in z-) ! \\n"
#end

#if (Len < 2*Border_R+D)   #local Len = 2*Border_R+D;
 #warning "\\nRound_Conic_Prism() macro called with length <= 2*border radius,\\n length set to 2*border radius+0.000001 ! \\n"
#end

#if (Len = 0)   #local Len = 2*Border_R+D;
 #warning "\\nRound_Conic_Prism() macro called with length in z- = 0,\\n length set to 2*border radius+0.000001 ! \\n"
#end

// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
// exchange upper and lower for construction if necessary (later they will changed back!)
#if ( (R_upper >= R_lower) & (C_distance>0)) #local Ro = R_upper; #local Ru = R_lower; #local Flag=0;
#else                                        #local Ro = R_lower; #local Ru = R_upper; #local Flag=1;
#end
// ----------------------------------------------------------------------------------------
#local Side_Len   = sqrt(abs( pow(C_distance,2) - pow( ( abs(Ro-Ru)),2) ) );
#local Side_Angle = degrees( atan( abs((Ro-Ru))/ Side_Len) );

//----------------------------------------------------------------------------------------
#if ( Merge_On = 1 ) union{
#else                merge{   #end
// around x-axis - turned later in z- direction
intersection{ // +z box pending
 box{< Border_R,0,-1.1*Ro-D>,<Len-Border_R,Side_Len,-D> translate<0,0,Ru> rotate< Side_Angle,0,0>}
 box{<-D,-Ro,-D>,<Len+D,C_distance+Ro,Ro+D>}
            } //end of intersection
intersection{ // +z box pending
 box{< Border_R,0,-1.1*Ro-D>,<Len-Border_R,Side_Len,-2*D> translate<0,0,Ru> rotate< Side_Angle,0,0>}
 box{<-D,-Ro,-D>,<Len+D,C_distance+Ro,Ro+D>}
 scale<1,1,-1>
            } //end of intersection
cylinder{ <Border_R,0,0>,<Len-Border_R,0,0>,Ro translate<0,C_distance,0>}
cylinder{ <Border_R,0,0>,<Len-Border_R,0,0>,Ru translate<0,0,0>}

#if ( Border_R > 0 )
// inner boxes full lenght
intersection{ // +z box pending
 box{< 0,0,-1.1*Ro-D>,<Len,Side_Len,D> translate<0,0,Ru-Border_R> rotate< Side_Angle,0,0>}
 box{<-D,-Ro,0>,<Len+D,C_distance+Ro,Ro+D>}
 } //end of intersection
intersection{ // +z box pending
 box{< 0,0,-1.1*Ro-D>,<Len,Side_Len,0> translate<0,0,Ru-Border_R> rotate< Side_Angle,0,0>}
 box{<-D,-Ro,-D>,<Len+D,C_distance+Ro,Ro+D>}
 scale<1,1,-1>
 } //end of intersection

// +z /-z border cylinder pending
 cylinder{< 0,0,-D>,<0,Side_Len,0>,Border_R translate<Border_R,0,Ru-Border_R> rotate< Side_Angle,0,0>}
 cylinder{< 0,0,-D>,<0,Side_Len,0>,Border_R translate<Border_R,0,Ru-Border_R> rotate< Side_Angle,0,0> scale<1,1,-1>}
 cylinder{< 0,0,-D>,<0,Side_Len,0>,Border_R translate<Len-Border_R,0,Ru-Border_R> rotate< Side_Angle,0,0>}
 cylinder{< 0,0,-D>,<0,Side_Len,0>,Border_R translate<Len-Border_R,0,Ru-Border_R> rotate< Side_Angle,0,0> scale<1,1,-1>}


 torus{ Ro-Border_R, Border_R rotate<0,0,90> translate<Border_R,C_distance,0>}
 torus{ Ru-Border_R, Border_R rotate<0,0,90> translate<Border_R,0,0>}
 torus{ Ro-Border_R, Border_R rotate<0,0,90> translate<Len-Border_R,C_distance,0>}
 torus{ Ru-Border_R, Border_R rotate<0,0,90> translate<Len-Border_R,0,0>}
 cylinder{ <0,0,0>,<Len,0,0>,Ro-Border_R translate<0,C_distance,0>}
 cylinder{ <0,0,0>,<Len,0,0>,Ru-Border_R translate<0,0,0>}
#end // of "#if ( Border_R > 0 )"

#if (Flag = 1) scale<1,-1,1> translate<0,C_distance,0> #end
rotate<0,90,0>
 } //end of union

#end// of macro ---------------------------------------<<<  end of macro Round_Conic_Prism()
// -----------------------------------------------------------------------------------------

// ----------------------------------------------<<< macro Half_Hollowed_Rounded_Cylinder1()
#macro Half_Hollowed_Rounded_Cylinder1( 
                               Len_total_, // total_Lenght from end to end
                               R_out_,     // outer radius 
                               R_Border_,  // border Radius < outer radius !!!
                               Border_Scale_y_, // ( >=0 ) 0 = no rounded borders!
                               Merge_On , // 0 = union, 1 = merge !
                             ) //-----------------------------------------------
//------------------------------------------------------------------------------
#local D = 0.000001; // just a little bit !!!
//------------------------------------------
#local Len_total = Len_total_; 
#local R_out = R_out_; 
#local R_Border = R_Border_; 
#local Border_Scale_y = Border_Scale_y_; 

#if ( R_out < R_Border )
 #warning "\\nHalf_Hollowed_Rounded_Cylinder1() macro called with outer radius < border radius,\\n radii exchanged ! \\n"
 #local Safe = R_Border;
 #local R_Border = R_out; 
 #local R_out = Safe; 
#end 
#if ( R_out - R_Border <= 0 + D)
 #warning "\\nHalf_Hollowed_Rounded_Cylinder1() macro called with outer radius ~ border radius,\\n border radius set to 0.00002 ! \\n"
 #local R_Border = 2*D
#end 
#local R_in = R_out - R_Border ;

#if ( Len_total < 2*R_out )
 #warning "\\nHalf_Hollowed_Rounded_Cylinder1() macro called with total length < 2*outer radius,\\n length increased to 2*outer radius. Results may not be as expected !\\n"
 #local Len_total = 2*R_out +D; 
#end 

#local Len = Len_total-2*R_out; // length of linear kernel  
#local R_Border = (R_out-R_in)/2 ; // Radius of the upper borders 
 
// ----------------------------------------------------------------- 
#if (Merge_On = 0)
 union{ 
#else 
 merge{ 
#end   
       // hollow half rounded cylinder   
       difference{
                   #if (Merge_On = 0)
                   union{ 
                   #else 
                   merge{ 
                   #end   
                     cylinder{ <-Len/2,0,0>,<Len/2,0,0>,R_out}
                     sphere{   <-Len/2,0,0>,R_out}
                     sphere{   < Len/2,0,0>,R_out}
                   }// end of union or merge
                  
                   cylinder {<-Len/2,0,0>,<Len/2,0,0>,R_in}
                   sphere {  <-Len/2,0,0>,R_in}
                   sphere {  < Len/2,0,0>,R_in}
                  
                // cut off the upper part
                   box{ <-Len-R_out-D,       D,-R_out-D>,
                        < Len+R_out+D, R_out+D, R_out+D>} 
                 }
       
   #if( Border_Scale_y > 0 )
     // rounded borders
      #if (Merge_On = 0)
      union{ 
      #else 
      merge{ 
      #end 
       // side cylinders  
       difference { 
       cylinder{ <-Len/2-D,0, R_in + R_Border >,
                 < Len/2+D,0, R_in + R_Border >,
                 R_Border }
       box{ <-Len-R_out-D,-R_Border-D,-R_out-D> 
            < Len+R_out+D,         -D, R_out+D>} 
       }
       difference { 
       cylinder{ <-Len/2-D,0,-R_in - R_Border >,
                 < Len/2+D,0,-R_in - R_Border >,
                 R_Border }
       box{ <-Len-R_out-D,-R_Border-D,-R_out-D> 
            < Len+R_out+D,         -D, R_out+D>} 
       } 
       // ending with half torii
       difference {  
           union { // 
             torus{ R_in+R_Border,R_Border sturm
                    translate <-Len/2,0,0>
                  }
             torus{ R_in+R_Border,R_Border sturm
                    translate < Len/2,0,0>
                  }
           } // end of inner union  
        
           cylinder {<-Len/2+D,0,0>,<Len/2-D,0,0>,R_out+D}
                  
           box{ <-Len-R_out-D,-R_Border-D,-R_out-D> 
                < Len+R_out+D,         -D, R_out+D>} 

        } // end of rounded borders base shape 
      scale <1,Border_Scale_y,1> 
     }// end borders
   #end// of "#if( Border_Scale_y > 0 )" 
 } // end of union or merge
#end // of macro  -----------------------<<<  end of macro Half_Hollowed_Rounded_Cylinder1()
// -----------------------------------------------------------------------------------------


// ----------------------------------------------<<< macro Half_Hollowed_Rounded_Cylinder2()
#macro Half_Hollowed_Rounded_Cylinder2( 
                               Len_total_, // total_Lenght from end to end
                               R_out_, // Radius_out, outer radius 
                               R_End_, // < R_out !  > 2*R_Border
                               R_Border_,  // border radius
                               Border_Scale_y_ // ( >0 ), 0 = no rounded borders
                               Merge_On, // 0 = union, 1 = merge !
                             ) //----------------------------------------------- 
// -----------------------------------------------------------------------------------------
#local D = 0.000001; // just a little bit !!!
// ------------------------------------------
#local Len_total = Len_total_; 
#local R_out = R_out_; 
#local R_End = R_End_;
#local R_Border = R_Border_; 
#local Border_Scale_y = Border_Scale_y_; 

#if ( R_End > Len_total/2 )
 #warning "\\nHalf_Rounded_Hollowed_Cylinder2() macro called with end radius < total lenght/2,\\nresults may not be as expected\\n"
 #local R_End = Len_total/2-2*D; 
#end 
#if ( R_out < R_Border )
 #warning "\\nHalf_Hollowed_Rounded_Cylinder1() macro called with outer radius < border radius,\\n radii exchanged ! \\n"
 #local Safe = R_Border;
 #local R_Border = R_out; 
 #local R_out = Safe; 
#end 

#local Len = Len_total-2*R_End; // length of linear kernel  
#local R_in = (R_out-2*R_Border) ; // Radius of the inner round cylindere 
#local D_Corner = R_out - R_End; 
// ------------------------------------------------------------------------------
#local Corner_Border = 
intersection{  
               torus{ R_End-R_Border, R_Border  sturm
                    }
               box  {<0,-D,0>,<R_End+D,R_Border+D,R_End+D> // +x +z corner 
                    }  
            } // end intersection
// ------------------------------------------------------------------------------
#if (Merge_On = 0)
 union{ 
#else 
 merge{ 
#end   
       //  hollow rounded cylinder   
       difference{

           object{ //Round_Cylinder(point A, point B, Radius, EdgeRadius, UseMerge)
                   Round_Cylinder(<-Len/2,0,0>, <Len/2,0,0>, R_out, R_End, Merge_On)  
                 } // --------------------------------------------------------------
           object{ //Round_Cylinder(point A, point B, Radius, EdgeRadius, UseMerge)
                   Round_Cylinder(<-Len/2+2*R_Border,0,0>, <Len/2-2*R_Border,0,0>, 
                                                  R_in,  R_End-2*R_Border, Merge_On)  
                   translate<0,D,0>
                 } // --------------------------------------------------------------

                   // cut off the upper part
              box{ <-Len-R_out-D,       D,-R_out-D>,
                   < Len+R_out+D, R_out+D, R_out+D>} 
                 }
       
   #if( Border_Scale_y > 0 )
   // rounded borders
   difference { // with 1/4 torii in the corners 
      #if (Merge_On = 0)
      union{                                              

      #else 
      merge{ 
      #end   
        
       cylinder{ <-Len/2-D +R_End,0, R_in + R_Border >,
                 < Len/2+D -R_End,0, R_in + R_Border >,
                 R_Border }
       cylinder{ <-Len/2-D +R_End,0,-R_in - R_Border >,
                 < Len/2+D -R_End,0,-R_in - R_Border >,
                 R_Border }

       object{  Corner_Border translate<Len/2-R_End,0,D_Corner>  } 
       object{  Corner_Border translate<Len/2-R_End,0,D_Corner> scale<-1,1, 1> } 
       object{  Corner_Border translate<Len/2-R_End,0,D_Corner> scale<-1,1,-1> } 
       object{  Corner_Border translate<Len/2-R_End,0,D_Corner> scale< 1,1,-1> } 
    
       cylinder{ <0,0,  R_out-R_End +D >,
                 <0,0,-(R_out-R_End)-D >,
                 R_Border 
                 translate <-Len/2+R_Border,0,0> }
       cylinder{ <0,0,  R_out-R_End +D >,
                 <0,0,-(R_out-R_End)-D >,
                 R_Border 
                 translate < Len/2-R_Border,0,0> }
     } // end inner union
                  
     box{ <-Len-R_out-D,-R_Border-D,-R_out-D> 
          < Len+R_out+D,         -D, R_out+D>} 
     
      
     scale <1,Border_Scale_y,1> 
   }// end difference borders
   #end// of "#if( Border_Scale_y > 0 )"

 } // end of union or merge
#end // of macro  ----------------------<<<  end of macro Half_Hollowed_Rounded_Cylinder2()
// -----------------------------------------------------------------------------------------

 
                                      
// --------------------------------------------------------
// --------------------------------------------------------

 #version Shapes3_Inc_Temp;
 #end
// --------------------------------------------------------
//--------------------------------------------------------- end of include file shapes3.inc
 `,
    'shapes_old.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File

#ifndef(Shapes_Old_Inc_Temp)
#declare Shapes_Old_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
    #debug "including shapes_old.inc\\n"
#end

/*
              Persistence of Vision Raytracer Version 3.5

                               IMPORTANT!
   This collection of standard shapes has been around since the days
   of DKB-Trace and early versions of POV-Ray.  Those versions had no
optomized primatives for planes, cones, disks etc.  Some of the definitions
  below may seem trivial or unnecessary given the POV-Ray 2.0 and higher
 object primatives.  We have retained these objects for compatibility with
                           earlier versions.

 With the release of POV-Ray 1.0, some of these shapes, in particular,
the "Disk_?" group, were changed from an earlier beta test and DKB-Trace
   style.  The file "shapes.old" is also included in this package for
                   compatibility with pre-1.0 scenes.

*/
//2001.7.27: renamed as shapes_old.inc for POV 3.5. The new shapes.inc
//file includes this file, so backwards compatability is preserved.


#declare Ellipsoid =
 sphere {<0, 0, 0>,1}

#declare Sphere =
 sphere {<0, 0, 0>,1}

#declare Cylinder_X =
 quadric
  {<0, 1, 1>,
   <0, 0, 0>,
   <0, 0, 0>, -1
  }

#declare Cylinder_Y =
 quadric
  {<1, 0, 1>,
   <0, 0, 0>,
   <0, 0, 0>, -1
  }

#declare Cylinder_Z =
 quadric
  {<1, 1, 0>,
   <0, 0, 0>,
   <0, 0, 0>, -1
  }

// Infinite cones
#declare QCone_X =
 quadric
  {<-1, 1, 1>,
   < 0, 0, 0>,
   < 0, 0, 0>, 0
  }

#declare QCone_Y =
 quadric
  {<1, -1, 1>,
   <0, 0, 0>,
   <0, 0, 0>, 0
  }

#declare QCone_Z =
 quadric
  {<1, 1, -1>,
   <0, 0, 0>,
   <0, 0, 0>, 0
  }

// Unit cones    
// The Cone_n objects were formerly defined as intersections of
// quadrics and boxes but now can be redefined with the cone primative.

#declare Cone_X = cone {x,0,-x,1}
#declare Cone_Y = cone {y,0,-y,1}
#declare Cone_Z = cone {z,0,-z,1}

// The Plane_nn objects were formerly defined as quadrics but now can
// be redefined as a plane.

#declare Plane_YZ = plane {x,0}
#declare Plane_XZ = plane {y,0}
#declare Plane_XY = plane {z,0}

/* y^2 + z^2 - x = 0 */
#declare Paraboloid_X =
 quadric
  {< 0, 1, 1>,
   < 0, 0, 0>,
   <-1, 0, 0>, 0
  }

/* x^2 + z^2 - y = 0 */
#declare Paraboloid_Y =
 quadric
  {<1,  0,  1>,
   <0,  0,  0>,
   <0, -1,  0>, 0
  }

/* x^2 + y^2 - z = 0 */
#declare Paraboloid_Z =
 quadric
  {<1,  1,  0>,
   <0,  0,  0>,
   <0,  0, -1>, 0
  }

/* y - x^2 + z^2 = 0 */
#declare Hyperboloid =
 quadric
  {<-1,  0,  1>,
   < 0,  0,  0>,
   < 0,  1,  0>, 0
  }

#declare Hyperboloid_Y =
 quadric                 /* Vertical hyperboloid */
  {<1, -1,  1>,          /*                      */
   <0,  0,  0>,          /*            \\   /     */
   <0,  0,  0>, -1       /* Like this:  ) (      */
  }                      /*            /   \\     */

// Cube using the procedural box primitive
#declare UnitBox = box { <-1, -1, -1>, <1, 1, 1> }

// This primitive used to be an intersection of six planes.  For speed,
// it is now a box and nothing else.
#declare Cube = box { <-1, -1, -1>, <1, 1, 1> }

// The Disk primitives are "capped" cylinders of unit length.
//
// They are now "unit" size, the same as a sphere with a radius of 1.
// They will now scale evenly in all directions.

#declare Disk_X =    /* Capped cylinder, Length in x axis */
 cylinder { x,-x,1}

#declare Disk_Y =    /* Capped cylinder, Length in y axis */
 cylinder { y,-y,1}

#declare Disk_Z =    /* Capped cylinder, Length in z axis */
 cylinder { z,-z,1}

#version Shapes_Old_Inc_Temp;
#end
`,
    'shapesq.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

#ifndef(ShapesQ_Inc_Temp)
#declare ShapesQ_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
#   debug "including shapesq.inc\\n"
#end

/*
              Persistence of Vision Raytracer Version 3.1
                      Quartic shapes include file
              Several cubic and quartic shape definitions
                          by Alexander Enzmann

 In the following descriptions, multiplication of two terms is
 shown as the two terms next to each other (i.e. x y, rather than
 x*y.  The expression c(n, m) is the binomial coefficient, n!/m!(n-m)!.

*/

/* Bicorn
  This curve looks like the top part of a paraboloid, bounded
  from below by another paraboloid.  The basic equation is:
     y^2 - (x^2 + z^2) y^2 - (x^2 + z^2 + 2 y - 1)^2 = 0.  */
#declare Bicorn =
 quartic
  {< 1,   0,   0,   0,  1,   0,   4,   2,   0, -2,
     0,   0,   0,   0,  0,   0,   0,   0,   0,  0,
     0,   0,   0,   1,  0,   3,   0,   4,   0, -4,
     1,   0,  -2,   0,  1>
  }

/* Crossed Trough
  This is a surface with four pieces that sweep up from the x-z plane.
  The equation is: y = x^2 z^2.  */
#declare Crossed_Trough =
 quartic
  {< 0,   0,   0,   0,  0,   0,   0,   4,   0,  0,
     0,   0,   0,   0,  0,   0,   0,   0,   0,  0,
     0,   0,   0,   0,  0,   0,   0,   0,   0, -1,
     0,   0,   0,   0,  0>
  }

/* a drop coming out of water? This is a curve formed by using the equation
  y = 1/2 x^2 (x + 1) as the radius of a cylinder having the x-axis as
  its central axis. The final form of the equation is:
     y^2 + z^2 = 0.5 (x^3 + x^2) */
#declare Cubic_Cylinder =
 quartic 
  {< 0,   0,   0,   -0.5, 0,   0,   0,   0,   0, -0.5,
     0,   0,   0,    0,   0,   0,   0,   0,   0,  0,
     0,   0,   0,    0,   0,   1,   0,   0,   0,  0,
     0,   0,   1,    0,   0>
  }

/* a cubic saddle. The equation is: z = x^3 - y^3. */
#declare Cubic_Saddle_1 =
 quartic 
  {< 0,   0,   0,    1,   0,   0,   0,   0,   0,  0,
     0,   0,   0,    0,   0,   0,   0,   0,   0,  0,
     0,   0,  -1,    0,   0,   0,   0,   0,   0,  0,
     0,   0,   0,   -1,   0>
  }

/* Variant of a devil's curve in 3-space.  This figure has a top and
  bottom part that are very similar to a hyperboloid of one sheet,
  however the central region is pinched in the middle leaving two
  teardrop shaped holes. The equation is:
     x^4 + 2 x^2 z^2 - 0.36 x^2 - y^4 + 0.25 y^2 + z^4 = 0.  */
#declare Devils_Curve =
 quartic 
  {<-1,   0,   0,    0,  0,   0,    0,  -2,   0,  0.36,
     0,   0,   0,    0,  0,   0,    0,   0,   0,  0,
     1,   0,   0,    0,  0,  -0.25, 0,   0,   0,  0,
    -1,   0,   0,    0,  0>
   }

/* Folium
  This is a folium rotated about the x-axis.  The formula is:
     2 x^2 - 3 x y^2 - 3 x z^2 + y^2 + z^2 = 0. */
#declare Folium =
 quartic 
  {< 0,   0,   0,    0,  0,   0,   0,   0,   0,  2,
     0,   0,  -3,    0,  0,   0,   0,  -3,   0,  0,
     0,   0,   0,    0,  0,   1,   0,   0,   0,  0,
     0,   0,   1,    0,  0>
  }

/* Glob - sort of like basic teardrop shape. The equation is:
   y^2 + z^2 = 0.5 x^5 + 0.5 x^4. */
#declare Glob_5 =
 poly 
  {5,
   <-0.5, 0,   0,  -0.5, 0,   0,   0,   0,   0,  0,
     0,   0,   0,   0,   0,   0,   0,   0,   0,  0,
     0,   0,   0,   0,   0,   0,   0,   0,   0,  0,
     0,   0,   0,   0,   0,   0,   0,   0,   0,  0,
     0,   0,   0,   0,   1,   0,   0,   0,   0,  0,
     0,   0,   0,   1,   0,   0>
  }

/* Variant of a lemniscate - the two lobes are much more teardrop-like. */
#declare Twin_Glob =
 poly 
  {6,
   < 4,   0,   0,   0,   0,   0,   0,   0,   0, -4,
     0,   0,   0,   0,   0,   0,   0,   0,   0,  0,
     0,   0,   0,   0,   0,   0,   0,   0,   0,  0,
     0,   0,   0,   0,   0,   0,   0,   0,   0,  0,
     0,   0,   0,   0,   0,   0,   0,   0,   0,  0,
     0,   0,   0,   0,   0,   0,   0,   0,   0,  0,
     0,   0,   0,   0,   0,   0,   0,   0,   0,  0,
     1,   0,   0,   0,   0,   0,   0,   0,   0,  0,
     0,   1,   0,   0>
  }

/*  Approximation to the helix z = arctan(y/x).

   The helix can be approximated with an algebraic equation (kept to the
   range of a quartic) with the following steps:

      tan(z) = y/x   =>  sin(z)/cos(z) = y/x   =>

   (1) x sin(z) - y cos(z) = 0

   Using the taylor expansions for sin, cos about z = 0,

      sin(z) = z - z^3/3! + z^5/5! - ...
      cos(z) = 1 - z^2/2! + z^6/6! - ...

   Throwing out the high order terms, the expression (1) can be written as:

      x (z - z^3/6) - y (1 + z^2/2) = 0, or

  (2) -1/6 x z^3 + x z + 1/2 y z^2 - y = 0

  This helix (2) turns 90 degrees in the range 0 <= z <= sqrt(2)/2.  By using
  scale <2 2 2>, the helix defined below turns 90 degrees in the range
  0 <= z <= sqrt(2) = 1.4042.
*/
#declare Helix =
 quartic 
  {<  0,   0,   0,    0,  0,   0,   0,      0,   0,  0,
      0,   0,   0,    0,  0,   0,  -0.1666, 0,   1,  0,
      0,   0,   0,    0,  0,   0,   0,      0.5, 0, -1,
      0,   0,   0,    0,  0>
   clipped_by
    {object {Cylinder_Z scale 2}
     plane  { z, 1.4142}
     plane  {-z, 0}
    }
   bounded_by{clipped_by}
  }

/* This is an alternate Helix, using clipped_by instead of csg intersection. */
#declare Helix_1 = object {Helix}

/* Hyperbolic Torus having major radius sqrt(40), minor radius sqrt(12).
  This figure is generated by sweeping a circle along the arms of a
  hyperbola.  The equation is:

     x^4 + 2 x^2 y^2 - 2 x^2 z^2 - 104 x^2 + y^4 - 2 y^2 z^2 +
     56 y^2 + z^4 + 104 z^2 + 784 = 0.

  See the description for the torus below. */
#declare Hyperbolic_Torus_40_12 =
 quartic 
  {< 1,   0,   0,    0,     2,   0,   0,  -2,   0, -104,
     0,   0,   0,    0,     0,   0,   0,   0,   0,    0,
     1,   0,   0,   -2,     0,  56,   0,   0,   0,    0,
     1,   0, 104,    0,   784>
  }

/* Lemniscate of Gerono
  This figure looks like two teardrops with their pointed ends connected.
  It is formed by rotating the Lemniscate of Gerono about the x-axis.
  The formula is:
     x^4 - x^2 + y^2 + z^2 = 0. */
#declare Lemniscate =
 quartic 
  {< 1,   0,   0,   0,   0,   0,   0,   0,   0, -1,
     0,   0,   0,   0,   0,   0,   0,   0,   0,  0,
     0,   0,   0,   0,   0,   1,   0,   0,   0,  0,
     0,   0,   1,   0,   0>
  }

/* This is a figure with a bumpy sheet on one side and something that
  looks like a paraboloid (but with an internal bubble).  The formula
  is:
     (x^2 + y^2 + a c x)^2 - (x^2 + y^2)(c - a x)^2.

   -99*x^4+40*x^3-98*x^2*y^2-98*x^2*z^2+99*x^2+40*x*y^2+40*x*z^2+y^4+2*y^2*z^2
   -y^2+z^4-z^2

*/
#declare Quartic_Loop_1 =
 quartic 
  {<99,   0,   0, -40,  98,   0,   0,  98,   0, -99,
     0,   0, -40,   0,   0,   0,   0, -40,   0,   0,
    -1,   0,   0,  -2,   0,   1,   0,   0,   0,   0,
    -1,   0,   1,   0,   0>
  }

/* Monkey Saddle
  This surface has three parts that sweep up and three down.  This gives
  a saddle that has a place for two legs and a tail... The equation is:

     z = c (x^3 - 3 x y^2).

  The value c gives a vertical scale to the surface - the smaller the
  value of c, the flatter the surface will be (near the origin). */
#declare Monkey_Saddle =
 quartic 
  {< 0,   0,   0,   1,  0,   0,   0,   0,   0,  0,
     0,   0,  -3,   0,  0,   0,   0,   0,   0,  0,
     0,   0,   0,   0,  0,   0,   0,   0,   0,  0,
     0,   0,   0,  -1,  0>
  }

/* Parabolic Torus having major radius sqrt(40), minor radius sqrt(12).
  This figure is generated by sweeping a circle along the arms of a
  parabola.  The equation is:

     x^4 + 2 x^2 y^2 - 2 x^2 z - 104 x^2 + y^4 - 2 y^2 z +
     56 y^2 + z^2 + 104 z + 784 = 0.

  See the description for the torus below. */
#declare Parabolic_Torus_40_12 =
 quartic 
  {< 1,   0,   0,    0,     2,   0,   0,   0,  -2, -104,
     0,   0,   0,    0,     0,   0,   0,   0,   0,    0,
     1,   0,   0,    0,    -2,  56,   0,   0,   0,    0,
     0,   0,   1,  104,   784>
  }

/* Piriform
  This figure looks like a hersheys kiss. It is formed by sweeping
  a Piriform about the x-axis.  a basic form of the equation is:
     (x^4 - x^3) + y^2 + z^2 = 0.
*/
#declare Piriform =
 quartic 
  {< 4,   0,   0,   -4,  0,   0,   0,   0,   0,  0,
     0,   0,   0,    0,  0,   0,   0,   0,   0,  0,
     0,   0,   0,    0,  0,   1,   0,   0,   0,  0,
     0,   0,   1,    0,  0>
  }

/* n-Roll Mill
  This curve in the plane looks like several hyperbolas with their
  bumps arranged about the origin.  The general formula is:

     x^n - c(n,2) x^(n-2) y^2 + c(n,4) x^(n-4) y^4 - ... = a

  When rendering in 3-Space, the resulting figure looks like a
  cylinder with indented sides.
*/

/* Quartic parabola - a 4th degree polynomial (has two bumps at the bottom)
  that has been swept around the z axis. The equation is:
     0.1 x^4 - x^2 - y^2 - z^2 + 0.9 = 0. */
#declare Quartic_Paraboloid =
 quartic 
  {< 0.1, 0,   0,  0,   0,   0,   0,   0,   0,  -1,
     0,   0,   0,  0,   0,   0,   0,   0,   0,   0,
     0,   0,   0,  0,   0,   0,   0,   0,   0,  -1,
     0,   0,  -1,  0,   0.9>
  }

/* Quartic Cylinder - a Space Needle?  */
#declare Quartic_Cylinder =
 quartic 
  {< 0,   0,   0,    0,   1,   0,   0,   0,   0,   0.01,
     0,   0,   0,    0,   0,   0,   0,   0,   0,   0,
     0,   0,   0,    1,   0,   0,   0,   0,   0,   0,
     0,   0,   0.01, 0,  -0.01>
  }

/* Steiners quartic surface */
#declare Steiner_Surface =
 quartic 
  {< 0,   0,   0,  0,  1,   0,   0,   1,   0,   0,
     0,   0,   0,  0,  1,   0,   0,   0,   0,   0,
     0,   0,   0,  1,  0,   0,   0,   0,   0,   0,
     0,   0,   0,  0,  0>
  }

/* Torus having major radius sqrt(40), minor radius sqrt(12) */
#declare Torus_40_12 =
 quartic 
  {< 1,   0,   0,    0,     2,   0,   0,   2,   0, -104,
     0,   0,   0,    0,     0,   0,   0,   0,   0,    0,
     1,   0,   0,    2,     0,  56,   0,   0,   0,    0,
     1,   0, -104,   0,   784>
  }

/* Witch of Agnesi */
#declare Witch_Hat =
 quartic 
  {<  0,   0,   0,   0,   0,   0,   1,   0,   0,   0,
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
      0,   0,   0,   0,   0,   0,   0,   1,   0,   0.04,
      0,   0,   0,   0,   0.04>
  }

/* very rough approximation to the sin-wave surface z = sin(2 pi x y).
  In order to get an approximation good to 7 decimals at a distance of
  1 from the origin would require a polynomial of degree around 60.  This
  would require around 200k coefficients. For best results, scale by
  something like <1 1 0.2>. */
#declare Sinsurf =
 poly 
  {6,
   <    0,   0,   0,    0,  0,   0,   0,   0,   0,  0,
    -1116.226, 0, 0,    0,  0,   0,   0,   0,   0,  0,
        0,   0,   0,    0,  0,   0,   0,   0,   0,  0,
        0,   0,   0,    0,  0,   0,   0,   0,   0,  0,
        0,   0,   0,    0,  0,   0,   0,   0,   0, 18.8496,
        0,   0,   0,    0,  0,   0,   0,   0,   0,  0,
        0,   0,   0,    0,  0,   0,   0,   0,   0,  0,
        0,   0,   0,    0,  0,   0,   0,   0,   0,  0,
        0,   0,  -1,    0>
   }

/* Empty quartic equation.  Ready to be filled with numbers...
  quartic
   {< 0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
      0,   0,   0,   0,   0>
   }
*/

#version ShapesQ_Inc_Temp;
#end
`,
    'skies.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: skies.inc
//    Last updated: 2001.7.24
//    Description: Sky textures, sky_spheres, and sky objects.

#ifndef(Skies_Inc_Temp)
#declare Skies_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
    #debug "including skies.inc\\n"
#end

/*

              Persistence of Vision Raytracer Version 3.1

  Contents:
    Pigments:    (building blocks for the stuff below)
    P_Cloud1     pigment layer, contains clear regions.  Use with background.
    P_Cloud2     pigment layer, contains clear regions.  Use with background.
    P_Cloud3     pigment layer, contains clear regions.  Use with background.

    SkySpheres:
    S_Cloud1     sky_sphere, uses P_Cloud2.
    S_Cloud2     sky_sphere  uses P_Cloud2.
    S_Cloud3     sky_sphere  uses P_Cloud3.
    S_Cloud4     sky_sphere  uses P_Cloud3.
    S_Cloud5     sky_sphere.  Opaque.

    Textures:
    T_Cloud1     2-layer texture using P_Cloud1 pigment, contains clear regions.
    T_Cloud2     1-layer texture, contains clear regions.
    T_Cloud3     2-layer texture, contains clear regions.

    Objects:
    O_Cloud1     sphere, radius 10000 with T_Cloud1 texture.
    O_Cloud2     union of 2 planes, with T_Cloud2 and T_Cloud3.

*/

#declare P_Cloud1 =
pigment {
    bozo
    turbulence 0.65
    octaves 6
    omega 0.7
    lambda 2
    color_map {
        [0.0, 0.1   color red 0.85 green 0.85 blue 0.85
                    color red 0.75 green 0.75 blue 0.75]
        [0.1, 0.5   color red 0.75 green 0.75 blue 0.75
                    color Clear]
        [0.5, 1.001 color Clear
                    color Clear]
    }
    scale <6, 1, 6>
}

#declare P_Cloud2 =
pigment {
    wrinkles
    turbulence 0.65
    octaves 6
    omega 0.7
    lambda 2
    color_map {
        [0.0, 0.1   color red 0.85 green 0.85 blue 0.85
                    color red 0.75 green 0.75 blue 0.75]
        [0.1, 0.5   color red 0.75 green 0.75 blue 0.75
                    color rgb <0.258, 0.258, 0.435>  ]
        [0.5, 1.001 color rgb <0.258, 0.258, 0.435>
                    color rgb <0.258, 0.258, 0.435> ]
    }
    scale <6, 1, 6>
}
#declare P_Cloud3 =
pigment {
    bozo
    color_map {
        [0.0, 0.1   color red 0.85 green 0.85 blue 0.85
                    color red 0.55 green 0.60 blue 0.65]
        [0.1, 0.5   color red 0.55 green 0.60 blue 0.65
                    color rgb <0.184, 0.184, 0.309> ]
        [0.5, 1.001 color rgb <0.184, 0.184, 0.309>
                    color rgb <0.1, 0.1, 0.2>]
    }
    turbulence 0.65
    octaves 6
    omega 0.707
    lambda 2
    scale <6, 4, 6>
}

#declare P_Cloud4 =
pigment {
    wrinkles
    turbulence 0.1
    lambda 2.2
    omega 0.707
    color_map {
        [0.20 SkyBlue * 0.85 ]
        [0.50 White ]
        [1.00 Gray70 ]
    }
    scale <0.5, 0.15, 1>
}

#declare S_Cloud1 =
sky_sphere {
    pigment {
        gradient y
        pigment_map {
            [0.01 rgb <0.847, 0.749, 0.847> ] // horizon
            [0.25 P_Cloud2 scale 0.25 rotate z*5]
            [0.60 P_Cloud3 scale <0.25, 0.15, 0.25> rotate z*10]
        }
    }
}

#declare S_Cloud2 =
sky_sphere {
    pigment {
        gradient y
        pigment_map {
            [0.00 rgb <0.847, 0.749, 0.847> ] // horizon
            [0.10 SkyBlue ]                   // horizon
            [0.20 P_Cloud4 ]
        }
    }
}

#declare S_Cloud3 =
sky_sphere {
    pigment {
        gradient y
        pigment_map {
            [0.10 rgb <0.258, 0.258, 0.435> ]
            [0.25 P_Cloud2 scale 0.15 ]
        }
    }
}

#declare S_Cloud4 =
sky_sphere {
    pigment {
        gradient y
        pigment_map {
            [0.00 rgb <0.184, 0.184, 0.309> ]
            [0.15 P_Cloud3 scale <0.05, 0.40, 0.05> rotate z*30 ]
            [0.45 P_Cloud3 scale <0.25, 0.15, 0.50> ]
        }
    }
}


#declare S_Cloud5 =
sky_sphere {
    pigment { rgb <0.258, 0.258, 0.435> }
    pigment {
        bozo
        turbulence 1.5
        octaves 10
        omega .5
        lambda 2.5
        color_map {
            [0.0, 0.5 color rgbt<.75, .75, .75, 0>
                      color rgbt<.9, .9, .9, .9> ]
            [0.5, 0.7 color rgbt<.9, .9, .9, .9>
                      color rgbt<1, 1, 1, 1> ]
            [0.7, 1.0 color rgbt<1, 1, 1, 1>
                      color rgbt<1, 1, 1, 1> ]
        }
    scale <1, 0.3, 10>
    }
    pigment {
        bozo
        turbulence 0.6
        octaves 10
        omega .5
        lambda 2.5
        color_map {
            [0.0, 0.4 color rgbt<.75, .75, .75, 0>
                      color rgbt<.9, .9, .9, .9> ]
            [0.4, 0.7 color rgbt<.9, .9, .9, .9>
                      color rgbt<1, 1, 1, 1> ]
            [0.7, 1.0 color rgbt<1, 1, 1, 1>
                      color rgbt<1, 1, 1, 1> ]
        }
    scale <1, 0.3, 10>
    }
    pigment {
        bozo
        turbulence 0.8
        octaves 10
        omega .5
        lambda 2.5
        color_map {
            [0.0, 0.4 color rgbt<.75, .75, .75, 0>
                      color rgbt<.9, .9, .9, .9> ]
            [0.4, 0.6 color rgbt<.9, .9, .9, .9>
                      color rgbt<1, 1, 1, 1> ]
            [0.6, 1.0 color rgbt<1, 1, 1, 1>
                      color rgbt<1, 1, 1, 1> ]
        }
    scale <1, 0.3, 10>
    }
}


// ***********************************
//  Bill Pulver's FBM Clouds
// A three-layer cloud texture.
// ***********************************
#declare T_Cloud1 =
texture {                              // The upper part of the clouds
    pigment {
        P_Cloud1
    }
    finish {
        ambient 1.0
        diffuse 0
    }
}
texture {                              // The darker underside of the clouds
    pigment {
        P_Cloud1
        translate -0.15*y
    }
    finish {
        ambient 0.6
        diffuse 0
    }
}

// T_Cloud1 mapped onto a sphere
#declare O_Cloud1 =
sphere { <0,0,0>, 10000
    texture {
        T_Cloud1
        scale 1000
    }
}

// ***********************************
//  Darin Dugger's "Kite" clouds
// ***********************************
#declare T_Cloud2 =
texture {
    pigment {
        bozo
        turbulence 1.5
        octaves 10
        omega .5
        lambda 2.5
        color_map {
            [0.0, 0.5 color rgbt<.75, .75, .75, 0>
                      color rgbt<.9, .9, .9, .9> ]
            [0.5, 0.7 color rgbt<.9, .9, .9, .9>
                      color rgbt<1, 1, 1, 1> ]
            [0.7, 1.0 color rgbt<1, 1, 1, 1>
                      color rgbt<1, 1, 1, 1> ]
        }
    }

    finish {
        ambient 0.9
        diffuse 0.1
    }
}

#declare T_Cloud3 =
texture {
    pigment {
        bozo
        turbulence 0.8 //0.6
        octaves 10
        omega .5
        lambda 2.5
        color_map {
            [0.0, 0.4 color rgbt<.75, .75, .75, 0>
                      color rgbt<.9, .9, .9, .9> ]
            [0.4, 0.7 color rgbt<.9, .9, .9, .9>
                      color rgbt<1, 1, 1, 1> ]
            [0.7, 1.0 color rgbt<1, 1, 1, 1>
                      color rgbt<1, 1, 1, 1> ]
        }
    }
    finish {
        ambient 1.0
        diffuse 0.0
    }
}
texture {
    pigment {
        bozo
        turbulence 0.8 //0.6
        octaves 10
        omega .5
        lambda 2.5
        color_map {
            [0.0, 0.4 color rgbt<.75, .75, .75, 0>
                      color rgbt<.9, .9, .9, .9> ]
            [0.4, 0.6 color rgbt<.9, .9, .9, .9>
                      color rgbt<1, 1, 1, 1> ]
            [0.6, 1.0 color rgbt<1, 1, 1, 1>
                      color rgbt<1, 1, 1, 1> ]
        }
    }
    finish {
        ambient 0.95
        diffuse 0.0
    }
scale .9
translate y*-0.15
}





// Darin Dugger's DD_Cloud_Sky texture mapped onto a pair of planes
// NOTE: Lowest plane is at y=500
#declare O_Cloud2 =
union {
    plane { y, 500
        texture {
            T_Cloud3
            scale 600
        }
    }
    plane { y, 3000
        texture {
            T_Cloud2
            scale <900,1,6000>
            translate x*3000
            rotate -30*y
        }
    }
}


#version Skies_Inc_Temp;
#end
`,
    'stage1.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

// Persistence Of Vision Raytracer version 3.1 sample file.
#include "colors.inc"
#include "textures.inc"
#include "shapes.inc"

#declare Camera1=
camera {
   location  <0, 0, -60>
   direction <0, 0,  10>
   look_at   <0, 0,   0>
}

camera { Camera1 }

light_source { <1000, 1000, -2000> color White}

plane { z, 1.01 pigment {checker color White color rgb <1,.8,.8>}hollow on }

`,
    'stars.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

#ifndef(Stars_Inc_Temp)
#declare Stars_Inc_Temp=version;
#version 3.5;

/*
         Persistence of Vision Raytracer Version 3.1


Here are some updated/additional Starfield textures which you can include 
in distribution with POVRAY 3.1.  These textures use some of the new 
features in POVRAY 3.1.  The starfields become more "dense" as you progress 
from Starfield1 to Starfield6 and add a little color since all stars are not 
white but light shades of white, blue, red, and yellow.

Respectfully;

Jeff Burton
jburton@apex.net
http://www.geocities.com/SoHo/2365
*/


#declare Starfield1 =
texture {
    pigment {
        granite
        color_map {
            [ 0.000  0.270 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.270  0.280 color rgb <.5,.5,.4> color rgb <.8,.8,.4> ]
            [ 0.280  0.470 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.470  0.480 color rgb <.4,.4,.5> color rgb <.4,.4,.8> ]
            [ 0.480  0.680 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.680  0.690 color rgb <.5,.4,.4> color rgb <.8,.4,.4> ]
            [ 0.690  0.880 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.880  0.890 color rgb <.5,.5,.5> color rgb < 1, 1, 1> ]
            [ 0.890  1.000 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
        }
    turbulence 1
    sine_wave
    scale .5
    }
    finish { diffuse 0 ambient 1 }
}

#declare Starfield2 =
texture {
    pigment {
        granite
        color_map {
            [ 0.000  0.270 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.270  0.285 color rgb <.5,.5,.4> color rgb <.8,.8,.4> ]
            [ 0.285  0.470 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.470  0.485 color rgb <.4,.4,.5> color rgb <.4,.4,.8> ]
            [ 0.485  0.680 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.680  0.695 color rgb <.5,.4,.4> color rgb <.8,.4,.4> ]
            [ 0.695  0.880 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.880  0.895 color rgb <.5,.5,.5> color rgb < 1, 1, 1> ]
            [ 0.895  1.000 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
        }
    turbulence 1
    sine_wave
    scale .5
    }
    finish { diffuse 0 ambient 1 }
}

#declare Starfield3 =
texture {
    pigment {
        granite
        color_map {
            [ 0.000  0.270 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.270  0.290 color rgb <.5,.5,.4> color rgb <.8,.8,.4> ]
            [ 0.290  0.470 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.470  0.490 color rgb <.4,.4,.5> color rgb <.4,.4,.8> ]
            [ 0.490  0.680 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.680  0.700 color rgb <.5,.4,.4> color rgb <.8,.4,.4> ]
            [ 0.700  0.880 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.880  0.900 color rgb <.5,.5,.5> color rgb < 1, 1, 1> ]
            [ 0.900  1.000 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
        }
    turbulence 1
    sine_wave
    scale .5
    }
    finish { diffuse 0 ambient 1 }
}

#declare Starfield4 =
texture {
    pigment {
        granite
        color_map {
            [ 0.000  0.270 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.270  0.300 color rgb <.5,.5,.4> color rgb <.8,.8,.4> ]
            [ 0.300  0.470 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.470  0.500 color rgb <.4,.4,.5> color rgb <.4,.4,.8> ]
            [ 0.500  0.670 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.670  0.700 color rgb <.5,.4,.4> color rgb <.8,.4,.4> ]
            [ 0.700  0.870 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.870  0.900 color rgb <.5,.5,.5> color rgb < 1, 1, 1> ]
            [ 0.900  1.000 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
        }
    turbulence 1
    sine_wave
    scale .5
    }
    finish { diffuse 0 ambient 1 }
}

#declare Starfield5 =
texture {
    pigment {
        granite
        color_map {
            [ 0.000  0.260 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.260  0.300 color rgb <.5,.5,.4> color rgb <.8,.8,.4> ]
            [ 0.300  0.460 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.460  0.500 color rgb <.4,.4,.5> color rgb <.4,.4,.8> ]
            [ 0.500  0.660 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.660  0.700 color rgb <.5,.4,.4> color rgb <.8,.4,.4> ]
            [ 0.700  0.860 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.860  0.900 color rgb <.5,.5,.5> color rgb < 1, 1, 1> ]
            [ 0.900  1.000 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
        }
    turbulence 1
    sine_wave
    scale .5
    }
    finish { diffuse 0 ambient 1 }
}

#declare Starfield6 =
texture {
    pigment {
        granite
        color_map {
            [ 0.000  0.250 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.250  0.300 color rgb <.5,.5,.4> color rgb <.8,.8,.4> ]
            [ 0.300  0.450 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.450  0.500 color rgb <.4,.4,.5> color rgb <.4,.4,.8> ]
            [ 0.500  0.650 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.650  0.700 color rgb <.5,.4,.4> color rgb <.8,.4,.4> ]
            [ 0.700  0.850 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
            [ 0.850  0.900 color rgb <.5,.5,.5> color rgb < 1, 1, 1> ]
            [ 0.900  1.000 color rgb < 0, 0, 0> color rgb < 0, 0, 0> ]
        }
    turbulence 1
    sine_wave
    scale .5
    }
    finish { diffuse 0 ambient 1 }
}

#version Stars_Inc_Temp;
#end
`,
    'stdcam.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

// Persistence Of Vision raytracer version 3.1 sample file.
camera {
    location <-2.0, 1.75, -5>
    right x*1.3333
    angle 70
    look_at <-0.75, -0.5, 0>
}

light_source { <20, 20, -25> rgb 1 }
plane { y, 0  pigment { Plum }}
`,
    'stdinc.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: stdinc.inc
//    Last updated: 2001.8.16
//    Description: The most commonly used include files.

#ifndef(STDINC_INC_TEMP)
#declare STDINC_INC_TEMP = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
    #debug "including stdinc.inc\\n"
#end

#include "colors.inc"
#include "shapes.inc"
#include "transforms.inc"
#include "consts.inc"
#include "functions.inc"
#include "math.inc"
#include "rand.inc"

#version STDINC_INC_TEMP;
#end//arrays.inc

`,
    'stoneold.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

#ifndef(Stoneold_Inc_Temp)
#declare Stoneold_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
#   debug "including stoneold.inc\\n"
#end

/*

              Persistence of Vision Raytracer Version 3.1

                  Stone textures by Mike Miller  1992
               Backwards-compatibility translation file.
           Translates old texture names to new texture names.
                     Use stones1.inc in the future.

*/

#include "stones1.inc"
#declare Grnt0   = texture { T_Grnt0   }
#declare Grnt1   = texture { T_Grnt1   }
#declare Grnt2   = texture { T_Grnt2   }
#declare Grnt3   = texture { T_Grnt3   }
#declare Grnt4   = texture { T_Grnt4   }
#declare Grnt5   = texture { T_Grnt5   }
#declare Grnt6   = texture { T_Grnt6   }
#declare Grnt7   = texture { T_Grnt7   }
#declare Grnt8   = texture { T_Grnt8   }
#declare Grnt9   = texture { T_Grnt9   }
#declare Grnt10  = texture { T_Grnt10  }
#declare Grnt11  = texture { T_Grnt11  }
#declare Grnt12  = texture { T_Grnt12  }
#declare Grnt13  = texture { T_Grnt13  }
#declare Grnt14  = texture { T_Grnt14  }
#declare Grnt15  = texture { T_Grnt15  }
#declare Grnt16  = texture { T_Grnt16  }
#declare Grnt17  = texture { T_Grnt17  }
#declare Grnt18  = texture { T_Grnt18  }
#declare Grnt19  = texture { T_Grnt19  }
#declare Grnt20  = texture { T_Grnt20  }
#declare Grnt21  = texture { T_Grnt21  }
#declare Grnt22  = texture { T_Grnt22  }
#declare Grnt23  = texture { T_Grnt23  }
#declare Grnt24  = texture { T_Grnt24  }
#declare Grnt25  = texture { T_Grnt25  }
#declare Grnt26  = texture { T_Grnt26  }
#declare Grnt27  = texture { T_Grnt27  }
#declare Grnt28  = texture { T_Grnt28  }
#declare Grnt29  = texture { T_Grnt29  }
#declare Grnt0a  = texture { T_Grnt0a  }
#declare Grnt1a  = texture { T_Grnt1a  }
#declare Grnt2a  = texture { T_Grnt2a  }
#declare Crack1  = texture { T_Crack1  }
#declare Crack2  = texture { T_Crack2  }
#declare Crack3  = texture { T_Crack3  }
#declare Crack4  = texture { T_Crack4  }
#declare Stone1  = texture { T_Stone1  }
#declare Stone2  = texture { T_Stone2  }
#declare Stone3  = texture { T_Stone3  }
#declare Stone4  = texture { T_Stone4  }
#declare Stone5  = texture { T_Stone5  }
#declare Stone6  = texture { T_Stone6  }
#declare Stone7  = texture { T_Stone7  }
#declare Stone8  = texture { T_Stone8  }
#declare Stone9  = texture { T_Stone9  }
#declare Stone10 = texture { T_Stone10 }
#declare Stone11 = texture { T_Stone11 }
#declare Stone12 = texture { T_Stone12 }
#declare Stone13 = texture { T_Stone13 }
#declare Stone14 = texture { T_Stone14 }
#declare Stone15 = texture { T_Stone15 }
#declare Stone16 = texture { T_Stone16 }
#declare Stone17 = texture { T_Stone17 }
#declare Stone18 = texture { T_Stone18 }
#declare Stone19 = texture { T_Stone19 }
#declare Stone20 = texture { T_Stone20 }
#declare Stone21 = texture { T_Stone21 }
#declare Stone22 = texture { T_Stone22 }
#declare Stone23 = texture { T_Stone23 }
#declare Stone24 = texture { T_Stone24 }

#version Stoneold_Inc_Temp;
#end
`,
    'stones.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

#ifndef(Stones_Inc_Temp)
#declare Stones_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
#   debug "including stones.inc\\n"
#end

/*
              Persistence of Vision Raytracer Version 3.1

           Combines stones1.inc and stones2.inc.  Use only if
              needed, since it will take longer to parse.

*/

#include "stones1.inc"
#include "stones2.inc"

#version Stones_Inc_Temp;
#end
`,
    'stones1.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: stones1.inc
//    Last updated: 2001.7.24
//    Description:

#ifndef(Stones1_Inc_Temp)
#declare Stones1_Inc_Temp = version;
#version 3.5;

/*     T_Stone1 through T_Stone24 created by Mike Miller, 1992

    Contains declared texture statements defining a variety of
    stone granite & marble textures. Most use the granite texture.
    Turbulence has no effect on granite, but turbulence is stated
    before the color map for convenience of switching to marble, which
    does need a turbulence to swirl the color. I tried to avoid using
    a random dither, but I find it helps create a subtle grain & can
    spark lost colors in the map. On multi-layered texture, try a float
    of about 0.05 on the first texture.

    Final Note: I would not "INCLUDE" this whole data file into a scene
                file if only one or two of these textures were being
                used...There are too many declares being used.

    -----------------------------------------------------------------------
    The textures T_Grnt0-T_Grnt29, T_Grnt0A-T_Grnt24A and Crack1-Crack4 are
    "building blocks" that are used to create the final "usable" textures,
    T_Stone1 - T_Stone24 (and other textures that *you* design, of course!)

    INDEX:

            T_Grnt0  - T_Grnt29   color maps (generally) contain no transmit values
            ------------------------------
                T_Grnt0  - Gray/Tan with Rose.
                T_Grnt1  - Creamy Whites with Yellow & Light Gray.
                T_Grnt2  - Deep Cream with Light Rose, Yellow, Orchid, & Tan.
                T_Grnt3  - Warm tans olive & light rose with cream.
                T_Grnt4  - Orchid, Sand & Mauve.
                T_Grnt5  - Medium Mauve Med.Rose & Deep Cream.
                T_Grnt6  - Med. Orchid, Olive & Dark Tan "mud pie".
                T_Grnt7  - Dark Orchid, Olive & Dark Putty.
                T_Grnt8  - Rose & Light Cream Yellows
                T_Grnt9  - Light Steely Grays
                T_Grnt10 - Gray Creams & Lavender Tans
                T_Grnt11 - Creams & Grays  Kahki
                T_Grnt12 - Tan Cream & Red Rose
                T_Grnt13 - Cream Rose Orange
                T_Grnt14 - Cream Rose & Light Moss w/Light Violet
                T_Grnt15 - Black with subtle chroma
                T_Grnt16 - White Cream & Peach
                T_Grnt17 - Bug Juice & Green
                T_Grnt18 - Rose & Creamy Yellow
                T_Grnt19 - Gray Marble with White feather Viens
                T_Grnt20 - White Marble with Gray feather Viens
                T_Grnt21 - Green Jade
                T_Grnt22 - Clear with White feather Viens (has some transparency)
                T_Grnt23 - Light Tan to Mauve
                T_Grnt24 - Light Grays
                T_Grnt25 - Moss Greens & Tan
                T_Grnt26 - Salmon with thin Green Viens
                T_Grnt27 - Dark Green & Browns
                T_Grnt28 - Red Swirl
                T_Grnt29 - White, Tan, w/ thin Red Viens

            T_Grnt0A - T_Grnt24A  color maps containing transmit
            ------------------------------
                T_Grnt0a  - Translucent T_Grnt0
                T_Grnt1a  - Translucent T_Grnt1
                T_Grnt2a  - Translucent T_Grnt2
                T_Grnt3a  - Translucent T_Grnt3
                T_Grnt4a  - Translucent T_Grnt4
                T_Grnt5a  - Translucent T_Grnt5
                T_Grnt6a  - Translucent T_Grnt6
                T_Grnt7a  - Translucent T_Grnt7
                T_Grnt8a  - Aqua Tints
                T_Grnt9a  - Transmit Creams With Cracks
                T_Grnt10a - Transmit Cream Rose & light yellow
                T_Grnt11a - Transmit Light Grays
                T_Grnt12a - Transmit Creams & Tans
                T_Grnt13a - Transmit Creams & Grays
                T_Grnt14a - Cream Rose & light moss
                T_Grnt15a - Transmit Sand & light Orange
                T_Grnt16a - Cream Rose & light moss (again?)
                T_Grnt17a - ???
                T_Grnt18a - ???
                T_Grnt19a - Gray Marble with White feather Viens with Transmit
                T_Grnt20a - White Feather Viens
                T_Grnt21a - Thin White Feather Viens
                T_Grnt22a - ???
                T_Grnt23a - Transparent Green Moss
                T_Grnt24a - ???

            T_Crack1 - T_Crack4   clear with an thin opaque band for T_Cracks
            ------------------------------
                T_Crack1 - T_Crack & Red Overtint
                T_Crack2 - Translucent Dark T_Cracks
                T_Crack3 - Overtint Green w/ Black T_Cracks
                T_Crack4 - Overtint w/ White T_Crack

            OTHERS

            Stone1 - Stone24  complete texture statements - edit to your
                              scene & lighting situations.
            ------------------------------
                T_Stone1 - Deep Rose & Green Marble with large White Swirls
                T_Stone2 - Light Greenish Tan Marble with Agate style veining
                T_Stone3 - Rose & Yellow Marble with fog white veining
                T_Stone4 - Tan Marble with Rose patches
                T_Stone5 - White Cream Marble with Pink veining
                T_Stone6 - Rose & Yellow Cream Marble
                T_Stone7 - Light Coffee Marble with darker patches
                T_Stone8 - Gray Granite with white patches
                T_Stone9 - White & Light Blue Marble with light violets
                T_Stone10- Dark Brown & Tan swirl Granite with gray undertones
                T_Stone11- Rose & White Marble with dark tan swirl
                T_Stone12- White & Pinkish Tan Marble
                T_Stone13- Medium Gray Blue Marble
                T_Stone14- Tan & Olive Marble with gray white veins
                T_Stone15- Deep Gray Marble with white veining
                T_Stone16- Peach & Yellow Marble with white veining
                T_Stone17- White Marble with gray veining
                T_Stone18- Green Jade with white veining
                T_Stone19- Peach Granite with white patches & green trim
                T_Stone20- Brown & Olive Marble with white veining
                T_Stone21- Red Marble with gray & white veining
                T_Stone22- Dark Tan Marble with gray & white veining
                T_Stone23- Peach & Cream Marble with orange veining
                T_Stone24- Green & Tan Moss Marble

    -----------------------------------------------------------------------
    This file was modified July 2001 to work as it should with POV-Ray 3.5,
all filters being changed to transmits.
*/

#ifdef(View_POV_Include_Stack)
    #debug "including stones1.inc\\n"
#end

//--------- Gray Tan with Rose
#declare T_Grnt0 =
texture {
pigment
 {granite
  turbulence 0.4
  color_map
   {[0.000, 0.153   color rgbt <0.729, 0.502, 0.451, 0.000>
                    color rgbt <0.769, 0.686, 0.592, 0.000>]
    [0.153, 0.398   color rgbt <0.769, 0.686, 0.592, 0.000>
                    color rgbt <0.843, 0.753, 0.718, 0.000>]
    [0.398, 0.559   color rgbt <0.843, 0.753, 0.718, 0.000>
                    color rgbt <0.780, 0.667, 0.561, 0.000>]
    [0.559, 0.729   color rgbt <0.780, 0.667, 0.561, 0.000>
                    color rgbt <0.741, 0.659, 0.576, 0.000>]
    [0.729, 1.001   color rgbt <0.741, 0.659, 0.576, 0.000>
                    color rgbt <0.729, 0.502, 0.451, 0.000>]
   }
 }
 }

//----- Creamy Whites with yellow & light gray
#declare T_Grnt1 =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.212   color rgbt <0.898, 0.898, 0.851, 0.000>
                    color rgbt <0.969, 0.980, 0.875, 0.000>]
    [0.212, 0.424   color rgbt <0.969, 0.980, 0.875, 0.000>
                    color rgbt <0.859, 0.859, 0.859, 0.000>]
    [0.424, 0.627   color rgbt <0.859, 0.859, 0.859, 0.000>
                    color rgbt <0.992, 0.922, 0.659, 0.000>]
    [0.627, 0.881   color rgbt <0.992, 0.922, 0.659, 0.000>
                    color rgbt <0.937, 0.965, 0.902, 0.000>]
    [0.881, 1.001   color rgbt <0.937, 0.965, 0.902, 0.000>
                    color rgbt <0.898, 0.898, 0.851, 0.000>]
   }
 }
 }

//------- Deep Cream with light rose, yellow orchid & tan
#declare T_Grnt2 =
texture {
pigment
 {granite
  turbulence 0.5
  color_map
   {[0.000, 0.178   color rgbt <0.863, 0.757, 0.596, 0.000>
                    color rgbt <0.925, 0.792, 0.714, 0.000>]
    [0.178, 0.356   color rgbt <0.925, 0.792, 0.714, 0.000>
                    color rgbt <0.871, 0.702, 0.659, 0.000>]
    [0.356, 0.525   color rgbt <0.871, 0.702, 0.659, 0.000>
                    color rgbt <0.992, 0.922, 0.659, 0.000>]
    [0.525, 0.729   color rgbt <0.992, 0.922, 0.659, 0.000>
                    color rgbt <0.902, 0.812, 0.714, 0.000>]
    [0.729, 1.001   color rgbt <0.902, 0.812, 0.714, 0.000>
                    color rgbt <0.863, 0.757, 0.596, 0.000>]
   }
 }
 }

//------- Warm tans olive & light rose with cream
#declare T_Grnt3 =
texture {
pigment
 {granite
  turbulence 0.5
  color_map
   {[0.000, 0.178   color rgbt <0.831, 0.631, 0.569, 0.000>
                    color rgbt <0.925, 0.831, 0.714, 0.000>]
    [0.178, 0.356   color rgbt <0.925, 0.831, 0.714, 0.000>
                    color rgbt <0.871, 0.702, 0.659, 0.000>]
    [0.356, 0.525   color rgbt <0.871, 0.702, 0.659, 0.000>
                    color rgbt <0.831, 0.631, 0.569, 0.000>]
    [0.525, 0.729   color rgbt <0.831, 0.631, 0.569, 0.000>
                    color rgbt <0.937, 0.882, 0.820, 0.000>]
    [0.729, 1.001   color rgbt <0.937, 0.882, 0.820, 0.000>
                    color rgbt <0.831, 0.631, 0.569, 0.000>]
   }
 }
 }

//-------- Orchid sand & mouve
#declare T_Grnt4 =
texture {
pigment
 {granite
  turbulence 0.5
  color_map
   {[0.000, 0.178   color rgbt <0.804, 0.569, 0.494, 0.000>
                    color rgbt <0.816, 0.725, 0.537, 0.000>]
    [0.178, 0.356   color rgbt <0.816, 0.725, 0.537, 0.000>
                    color rgbt <0.820, 0.580, 0.522, 0.000>]
    [0.356, 0.525   color rgbt <0.820, 0.580, 0.522, 0.000>
                    color rgbt <0.882, 0.725, 0.537, 0.000>]
    [0.525, 0.729   color rgbt <0.882, 0.725, 0.537, 0.000>
                    color rgbt <0.855, 0.729, 0.584, 0.000>]
    [0.729, 1.001   color rgbt <0.855, 0.729, 0.584, 0.000>
                    color rgbt <0.804, 0.569, 0.494, 0.000>]
   }
 }
 }

//------- Medium Mauve Med.Rose & deep cream
#declare T_Grnt5 =
texture {
pigment
 {granite
  turbulence 0.5
  color_map
   {[0.000, 0.178   color rgbt <0.804, 0.569, 0.494, 0.000>
                    color rgbt <0.855, 0.729, 0.584, 0.000>]
    [0.178, 0.356   color rgbt <0.855, 0.729, 0.584, 0.000>
                    color rgbt <0.667, 0.502, 0.478, 0.000>]
    [0.356, 0.525   color rgbt <0.667, 0.502, 0.478, 0.000>
                    color rgbt <0.859, 0.624, 0.545, 0.000>]
    [0.525, 0.729   color rgbt <0.859, 0.624, 0.545, 0.000>
                    color rgbt <0.855, 0.729, 0.584, 0.000>]
    [0.729, 1.001   color rgbt <0.855, 0.729, 0.584, 0.000>
                    color rgbt <0.804, 0.569, 0.494, 0.000>]
   }
 }
 }

//--------- Med. Orchid Olive & Dark Tan "mud pie"
#declare T_Grnt6 =
texture {
pigment
 {granite
  turbulence 0.5
  color_map
   {[0.000, 0.153   color rgbt <0.545, 0.380, 0.345, 0.000>
                    color rgbt <0.588, 0.475, 0.333, 0.000>]
    [0.153, 0.398   color rgbt <0.588, 0.475, 0.333, 0.000>
                    color rgbt <0.675, 0.478, 0.404, 0.000>]
    [0.398, 0.559   color rgbt <0.675, 0.478, 0.404, 0.000>
                    color rgbt <0.757, 0.635, 0.522, 0.000>]
    [0.559, 0.729   color rgbt <0.757, 0.635, 0.522, 0.000>
                    color rgbt <0.659, 0.549, 0.443, 0.000>]
    [0.729, 1.001   color rgbt <0.659, 0.549, 0.443, 0.000>
                    color rgbt <0.545, 0.380, 0.345, 0.000>]
   }
 }
 }

//------- Dark Orchid Olive & Dark Putty
#declare T_Grnt7 =
texture {
pigment
 {granite
  turbulence 0.5
  color_map
   {[0.000, 0.153   color rgbt <0.439, 0.310, 0.282, 0.000>
                    color rgbt <0.463, 0.369, 0.259, 0.000>]
    [0.153, 0.398   color rgbt <0.463, 0.369, 0.259, 0.000>
                    color rgbt <0.541, 0.369, 0.298, 0.000>]
    [0.398, 0.559   color rgbt <0.541, 0.369, 0.298, 0.000>
                    color rgbt <0.573, 0.424, 0.286, 0.000>]
    [0.559, 0.729   color rgbt <0.573, 0.424, 0.286, 0.000>
                    color rgbt <0.494, 0.396, 0.306, 0.000>]
    [0.729, 1.001   color rgbt <0.494, 0.396, 0.306, 0.000>
                    color rgbt <0.439, 0.310, 0.282, 0.000>]
   }
 }
 }

//--------- Rose & Light cream Yellows
#declare T_Grnt8 =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.179   color rgbt <0.843, 0.655, 0.655, 0.000>
                    color rgbt <0.886, 0.769, 0.627, 0.000>]
    [0.179, 0.368   color rgbt <0.886, 0.769, 0.627, 0.000>
                    color rgbt <0.906, 0.820, 0.714, 0.000>]
    [0.368, 0.538   color rgbt <0.906, 0.820, 0.714, 0.000>
                    color rgbt <0.851, 0.671, 0.671, 0.000>]
    [0.538, 0.846   color rgbt <0.851, 0.671, 0.671, 0.000>
                    color rgbt <0.890, 0.792, 0.675, 0.000>]
    [0.846, 0.983   color rgbt <0.890, 0.792, 0.675, 0.000>
                    color rgbt <0.827, 0.612, 0.612, 0.000>]
    [0.983, 1.001   color rgbt <0.827, 0.612, 0.612, 0.000>
                    color rgbt <0.843, 0.655, 0.655, 0.000>]
   }
 }
 }

//--------- Light Steely Grays
#declare T_Grnt9 =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.154   color rgbt <0.894, 0.886, 0.886, 0.000>
                    color rgbt <0.745, 0.745, 0.753, 0.000>]
    [0.154, 0.308   color rgbt <0.745, 0.745, 0.753, 0.000>
                    color rgbt <0.902, 0.902, 0.859, 0.000>]
    [0.308, 0.444   color rgbt <0.902, 0.902, 0.859, 0.000>
                    color rgbt <0.729, 0.706, 0.694, 0.000>]
    [0.444, 0.615   color rgbt <0.729, 0.706, 0.694, 0.000>
                    color rgbt <0.588, 0.592, 0.635, 0.000>]
    [0.615, 0.803   color rgbt <0.588, 0.592, 0.635, 0.000>
                    color rgbt <0.608, 0.616, 0.659, 0.000>]
    [0.803, 1.001   color rgbt <0.608, 0.616, 0.659, 0.000>
                    color rgbt <0.894, 0.886, 0.886, 0.000>]
   }
 }
 }

//--------- Gray Creams & lavender tans
#declare T_Grnt10 =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.154   color rgbt <0.890, 0.690, 0.690, 0.000>
                    color rgbt <0.996, 0.835, 0.737, 0.000>]
    [0.154, 0.308   color rgbt <0.996, 0.835, 0.737, 0.000>
                    color rgbt <0.745, 0.635, 0.651, 0.004>]
    [0.308, 0.444   color rgbt <0.745, 0.635, 0.651, 0.004>
                    color rgbt <0.733, 0.596, 0.557, 0.004>]
    [0.444, 0.615   color rgbt <0.733, 0.596, 0.557, 0.004>
                    color rgbt <0.996, 0.835, 0.737, 0.000>]
    [0.615, 0.803   color rgbt <0.996, 0.835, 0.737, 0.000>
                    color rgbt <0.765, 0.616, 0.659, 0.000>]
    [0.803, 1.001   color rgbt <0.765, 0.616, 0.659, 0.000>
                    color rgbt <0.890, 0.690, 0.690, 0.000>]
   }
 }
 }

//--------- Creams & Grays Kakhi
#declare T_Grnt11 =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.154   color rgbt <0.800, 0.651, 0.557, 0.000>
                    color rgbt <0.996, 0.835, 0.737, 0.000>]
    [0.154, 0.308   color rgbt <0.996, 0.835, 0.737, 0.000>
                    color rgbt <0.800, 0.651, 0.557, 0.000>]
    [0.308, 0.444   color rgbt <0.800, 0.651, 0.557, 0.000>
                    color rgbt <0.694, 0.624, 0.604, 0.004>]
    [0.444, 0.615   color rgbt <0.694, 0.624, 0.604, 0.004>
                    color rgbt <0.800, 0.651, 0.557, 0.000>]
    [0.615, 0.812   color rgbt <0.800, 0.651, 0.557, 0.000>
                    color rgbt <0.725, 0.655, 0.651, 0.000>]
    [0.812, 1.001   color rgbt <0.725, 0.655, 0.651, 0.000>
                    color rgbt <0.800, 0.651, 0.557, 0.000>]
   }
 }
 }

//--------- Tan Cream & Red Rose
#declare T_Grnt12 =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.154   color rgbt <0.996, 0.969, 0.800, 0.000>
                    color rgbt <0.996, 0.682, 0.604, 0.000>]
    [0.154, 0.308   color rgbt <0.996, 0.682, 0.604, 0.000>
                    color rgbt <0.906, 0.820, 0.714, 0.000>]
    [0.308, 0.444   color rgbt <0.906, 0.820, 0.714, 0.000>
                    color rgbt <0.816, 0.631, 0.537, 0.000>]
    [0.444, 0.615   color rgbt <0.816, 0.631, 0.537, 0.000>
                    color rgbt <0.890, 0.792, 0.675, 0.000>]
    [0.615, 0.812   color rgbt <0.890, 0.792, 0.675, 0.000>
                    color rgbt <0.973, 0.627, 0.627, 0.000>]
    [0.812, 1.001   color rgbt <0.973, 0.627, 0.627, 0.000>
                    color rgbt <0.996, 0.969, 0.800, 0.000>]
   }
 }
 }

//--------- Cream Rose orange
#declare T_Grnt13 =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.154   color rgbt <0.996, 0.824, 0.780, 0.000>
                    color rgbt <0.996, 0.698, 0.624, 0.000>]
    [0.154, 0.308   color rgbt <0.996, 0.698, 0.624, 0.000>
                    color rgbt <0.906, 0.675, 0.553, 0.000>]
    [0.308, 0.444   color rgbt <0.906, 0.675, 0.553, 0.000>
                    color rgbt <0.996, 0.682, 0.604, 0.000>]
    [0.444, 0.615   color rgbt <0.996, 0.682, 0.604, 0.000>
                    color rgbt <0.996, 0.824, 0.780, 0.000>]
    [0.615, 0.812   color rgbt <0.996, 0.824, 0.780, 0.000>
                    color rgbt <0.973, 0.627, 0.627, 0.000>]
    [0.812, 1.001   color rgbt <0.973, 0.627, 0.627, 0.000>
                    color rgbt <0.996, 0.824, 0.780, 0.000>]
   }
 }
 }

//--------- Cream Rose & light moss & light Violet
#declare T_Grnt14 =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.154   color rgbt <0.690, 0.612, 0.569, 0.000>
                    color rgbt <0.737, 0.596, 0.522, 0.000>]
    [0.154, 0.368   color rgbt <0.737, 0.596, 0.522, 0.000>
                    color rgbt <0.776, 0.702, 0.624, 0.000>]
    [0.368, 0.538   color rgbt <0.776, 0.702, 0.624, 0.000>
                    color rgbt <0.796, 0.678, 0.643, 0.000>]
    [0.538, 0.846   color rgbt <0.796, 0.678, 0.643, 0.000>
                    color rgbt <0.690, 0.612, 0.569, 0.000>]
    [0.846, 0.932   color rgbt <0.690, 0.612, 0.569, 0.000>
                    color rgbt <0.773, 0.612, 0.569, 0.000>]
    [0.932, 1.001   color rgbt <0.773, 0.612, 0.569, 0.000>
                    color rgbt <0.690, 0.612, 0.569, 0.000>]
   }
 }
 }

//--------- Black with subtle chroma
#declare T_Grnt15 =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.104   color rgbt <0.161, 0.133, 0.118, 0.000>
                    color rgbt <0.110, 0.082, 0.071, 0.000>]
    [0.104, 0.252   color rgbt <0.110, 0.082, 0.071, 0.000>
                    color rgbt <0.161, 0.133, 0.118, 0.000>]
    [0.252, 0.383   color rgbt <0.161, 0.133, 0.118, 0.000>
                    color rgbt <0.000, 0.000, 0.000, 0.000>]
    [0.383, 0.643   color rgbt <0.000, 0.000, 0.000, 0.000>
                    color rgbt <0.161, 0.133, 0.118, 0.000>]
    [0.643, 0.783   color rgbt <0.161, 0.133, 0.118, 0.000>
                    color rgbt <0.220, 0.149, 0.137, 0.000>]
    [0.783, 0.922   color rgbt <0.220, 0.149, 0.137, 0.000>
                    color rgbt <0.000, 0.000, 0.000, 0.000>]
    [0.922, 0.983   color rgbt <0.000, 0.000, 0.000, 0.000>
                    color rgbt <0.220, 0.149, 0.137, 0.000>]
    [0.983, 1.001   color rgbt <0.220, 0.149, 0.137, 0.000>
                    color rgbt <0.161, 0.133, 0.118, 0.000>]
   }
 }
 }

//----- White Cream & Peach
#declare T_Grnt16 =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.316   color rgbt <0.910, 0.788, 0.788, 0.000>
                    color rgbt <0.922, 0.914, 0.871, 0.000>]
    [0.316, 0.453   color rgbt <0.922, 0.914, 0.871, 0.000>
                    color rgbt <0.894, 0.867, 0.780, 0.000>]
    [0.453, 0.624   color rgbt <0.894, 0.867, 0.780, 0.000>
                    color rgbt <0.784, 0.788, 0.788, 0.000>]
    [0.624, 0.726   color rgbt <0.784, 0.788, 0.788, 0.000>
                    color rgbt <0.851, 0.812, 0.741, 0.000>]
    [0.726, 0.863   color rgbt <0.851, 0.812, 0.741, 0.000>
                    color rgbt <0.647, 0.655, 0.655, 0.000>]
    [0.863, 1.001   color rgbt <0.647, 0.655, 0.655, 0.000>
                    color rgbt <0.910, 0.788, 0.788, 0.000>]
   }
 }
 }

//----- Bug Juice & Green
#declare T_Grnt17 =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.303   color rgbt <0.000, 0.239, 0.000, 0.000>
                    color rgbt <0.333, 0.294, 0.000, 0.000>]
    [0.303, 0.588   color rgbt <0.333, 0.294, 0.000, 0.000>
                    color rgbt <0.000, 0.239, 0.341, 0.000>]
    [0.588, 0.790   color rgbt <0.000, 0.239, 0.341, 0.000>
                    color rgbt <0.000, 0.020, 0.000, 0.000>]
    [0.790, 1.001   color rgbt <0.000, 0.020, 0.000, 0.000>
                    color rgbt <0.000, 0.239, 0.000, 0.000>]
   }
 }
 }

//------------ Rose & cream yellow
#declare T_Grnt18 =
texture {
pigment
 {granite
  turbulence 0.4
  color_map
   {[0.000, 0.202   color rgbt <1.000, 0.718, 0.541, 0.000>
                    color rgbt <0.890, 0.651, 0.612, 0.000>]
    [0.202, 0.298   color rgbt <0.890, 0.651, 0.612, 0.000>
                    color rgbt <1.000, 0.820, 0.675, 0.000>]
    [0.298, 0.377   color rgbt <1.000, 0.820, 0.675, 0.000>
                    color rgbt <0.890, 0.643, 0.612, 0.000>]
    [0.377, 0.465   color rgbt <0.890, 0.643, 0.612, 0.000>
                    color rgbt <0.937, 0.729, 0.561, 0.000>]
    [0.465, 0.544   color rgbt <0.937, 0.729, 0.561, 0.000>
                    color rgbt <0.878, 0.604, 0.565, 0.000>]
    [0.544, 0.640   color rgbt <0.878, 0.604, 0.565, 0.000>
                    color rgbt <0.984, 0.780, 0.655, 0.000>]
    [0.640, 0.860   color rgbt <0.984, 0.780, 0.655, 0.000>
                    color rgbt <1.000, 0.863, 0.635, 0.000>]
    [0.860, 0.982   color rgbt <1.000, 0.863, 0.635, 0.000>
                    color rgbt <1.000, 0.765, 0.620, 0.000>]
    [0.982, 1.001   color rgbt <1.000, 0.765, 0.620, 0.000>
                    color rgbt <1.000, 0.718, 0.541, 0.000>]
   }
 }
 }

//--------- Gray Marble with White feather Viens
#declare T_Grnt19 =
texture {
pigment
 {granite
  turbulence 0.0
  color_map
   {[0.0, 0.3 color White color DimGray]
    [0.3, 0.4 color DimGray color DimGray]
    [0.4, 0.6 color DimGray color DimGray]
    [0.6, 1.0 color DimGray color DimGray]
   }
 }
 finish {
  crand 0.02
 }
 }

//--------- White Marble with Gray feather Viens
#declare T_Grnt20 =
texture {
pigment
 {granite
  turbulence 0.0
  color_map
   {[0.0, 0.3 color Mica color White]
    [0.3, 0.4 color White color White]
    [0.4, 0.6 color White color White]
    [0.6, 1.0 color White color White]
   }
 }
 finish {
  crand 0.02
 }
 }

//-------- Declare Green Colors
#declare g1 = color red 0.26 green 0.41 blue 0.31; //---Light Gray Green
#declare g2 = color red 0.27 green 0.34 blue 0.26; //---Med Gray Green
#declare g3 = color red 0.13 green 0.29 blue 0.28; //---Med Gray Aqua
#declare g4 = color red 0.03 green 0.18 blue 0.08; //---Dark Green

//--------- Green Jade
#declare T_Grnt21 =
texture {
pigment
 {granite
  turbulence 0.0
  color_map
   {[0.0, 0.1 color White    transmit 0.3 color SeaGreen  transmit 0.4]
    [0.1, 0.3 color SeaGreen transmit 0.4 color g2        transmit 0.7]
    [0.3, 0.5 color g2       transmit 0.7 color DarkGreen transmit 0.7]
    [0.5, 0.7 color DarkGreen  transmit 0.7 color g4 transmit 0.7]
    [0.7, 0.8 color g4         transmit 0.7 color DarkGreen transmit 0.7]
    [0.8, 1.0 color DarkGreen  transmit 0.7 color DarkGreen transmit 0.7]
   }
 }
 finish {
  crand 0.02
 }
 }

//--------- Clear with White feather Viens ----- This one does contain Transmit
#declare T_Grnt22 =
texture {
pigment
 {granite
  turbulence 0.0
  color_map
   {[0.0, 0.07 color White color White]
    [0.07, 0.2 color White color DimGray]
    [0.2, 0.3 color DimGray color Clear]
    [0.3, 0.7 color Clear color Clear]
    [0.7, 1.0 color Clear color DimGray]
   }
 }
 finish {
  crand 0.02
 }
 }

//---------- Light Tan to Mouve
#declare T_Grnt23 =
texture {
pigment
 {marble
  turbulence 0.5
  color_map
   {[0.000, 0.178   color rgbt <0.831, 0.631, 0.569, 0.000>
                    color rgbt <0.925, 0.831, 0.714, 0.000>]
    [0.178, 0.356   color rgbt <0.925, 0.831, 0.714, 0.000>
                    color rgbt <0.871, 0.702, 0.659, 0.000>]
    [0.356, 0.525   color rgbt <0.871, 0.702, 0.659, 0.000>
                    color rgbt <0.831, 0.631, 0.569, 0.000>]
    [0.525, 0.729   color rgbt <0.831, 0.631, 0.569, 0.000>
                    color rgbt <0.937, 0.882, 0.820, 0.000>]
    [0.729, 1.001   color rgbt <0.937, 0.882, 0.820, 0.000>
                    color rgbt <0.831, 0.631, 0.569, 0.000>]
   }
 }
 }

//--------- Light Grays
#declare T_Grnt24 =
texture {
pigment
 {marble
  turbulence 0.6
  color_map
   {[0.000, 0.154   color rgbt <0.894, 0.886, 0.886, 0.000>
                    color rgbt <0.745, 0.745, 0.753, 0.000>]
    [0.154, 0.308   color rgbt <0.745, 0.745, 0.753, 0.000>
                    color rgbt <0.902, 0.902, 0.859, 0.000>]
    [0.308, 0.444   color rgbt <0.902, 0.902, 0.859, 0.000>
                    color rgbt <0.729, 0.706, 0.694, 0.000>]
    [0.444, 0.615   color rgbt <0.729, 0.706, 0.694, 0.000>
                    color rgbt <0.588, 0.592, 0.635, 0.000>]
    [0.615, 0.803   color rgbt <0.588, 0.592, 0.635, 0.000>
                    color rgbt <0.608, 0.616, 0.659, 0.000>]
    [0.803, 1.001   color rgbt <0.608, 0.616, 0.659, 0.000>
                    color rgbt <0.894, 0.886, 0.886, 0.000>]
   }
 }
 }

//------------ Moss Greens & Tan
#declare T_Grnt25 =
texture {
pigment
 {marble
  turbulence 0.7
  color_map
   {[0.000, 0.168   color rgbt <0.824, 0.725, 0.584, 0.000>
                    color rgbt <0.514, 0.584, 0.533, 0.000>]
    [0.168, 0.301   color rgbt <0.514, 0.584, 0.533, 0.000>
                    color rgbt <0.298, 0.376, 0.318, 0.000>]
    [0.301, 0.398   color rgbt <0.298, 0.376, 0.318, 0.000>
                    color rgbt <0.263, 0.337, 0.282, 0.000>]
    [0.398, 0.558   color rgbt <0.263, 0.337, 0.282, 0.000>
                    color rgbt <0.431, 0.506, 0.451, 0.000>]
    [0.558, 0.655   color rgbt <0.431, 0.506, 0.451, 0.000>
                    color rgbt <0.529, 0.631, 0.471, 0.000>]
    [0.655, 0.735   color rgbt <0.529, 0.631, 0.471, 0.000>
                    color rgbt <0.333, 0.376, 0.318, 0.000>]
    [0.735, 0.823   color rgbt <0.333, 0.376, 0.318, 0.000>
                    color rgbt <0.298, 0.376, 0.318, 0.000>]
    [0.823, 0.876   color rgbt <0.298, 0.376, 0.318, 0.000>
                    color rgbt <0.416, 0.376, 0.318, 0.000>]
    [0.876, 0.929   color rgbt <0.416, 0.376, 0.318, 0.000>
                    color rgbt <0.416, 0.376, 0.318, 0.000>]
    [0.929, 1.001   color rgbt <0.416, 0.376, 0.318, 0.000>
                    color rgbt <0.824, 0.725, 0.584, 0.000>]
   }
 }
 }

//---------- Salmon with thin Green Viens
#declare T_Grnt26 =
texture {
pigment
 {granite
  color_map
   {[0.000, 0.241   color rgbt <0.973, 0.973, 0.976, 0.000>
                    color rgbt <0.973, 0.973, 0.976, 0.000>]
    [0.241, 0.284   color rgbt <0.973, 0.973, 0.976, 0.000>
                    color rgbt <0.600, 0.741, 0.608, 0.000>]
    [0.284, 0.336   color rgbt <0.600, 0.741, 0.608, 0.000>
                    color rgbt <0.820, 0.643, 0.537, 0.000>]
    [0.336, 0.474   color rgbt <0.820, 0.643, 0.537, 0.000>
                    color rgbt <0.886, 0.780, 0.714, 0.000>]
    [0.474, 0.810   color rgbt <0.886, 0.780, 0.714, 0.000>
                    color rgbt <0.996, 0.643, 0.537, 0.000>]
    [0.810, 0.836   color rgbt <0.996, 0.643, 0.537, 0.000>
                    color rgbt <0.973, 0.973, 0.976, 0.000>]
    [0.836, 1.001   color rgbt <0.973, 0.973, 0.976, 0.000>
                    color rgbt <0.973, 0.973, 0.976, 0.000>]
   }
 }
 finish {
  crand 0.02
 }
 }

//------ Dark Green & Browns
#declare T_Grnt27 =
texture {
pigment
 {granite
  color_map
   {[0.000, 0.043   color rgbt <0.773, 0.647, 0.569, 0.000>
                    color rgbt <0.431, 0.322, 0.227, 0.000>]
    [0.043, 0.113   color rgbt <0.431, 0.322, 0.227, 0.000>
                    color rgbt <0.278, 0.282, 0.216, 0.000>]
    [0.113, 0.304   color rgbt <0.278, 0.282, 0.216, 0.000>
                    color rgbt <0.278, 0.282, 0.216, 0.000>]
    [0.304, 0.426   color rgbt <0.278, 0.282, 0.216, 0.000>
                    color rgbt <0.459, 0.341, 0.243, 0.000>]
    [0.426, 0.843   color rgbt <0.459, 0.341, 0.243, 0.000>
                    color rgbt <0.459, 0.341, 0.243, 0.000>]
    [0.843, 0.878   color rgbt <0.459, 0.341, 0.243, 0.000>
                    color rgbt <0.459, 0.341, 0.243, 0.000>]
    [0.878, 0.983   color rgbt <0.459, 0.341, 0.243, 0.000>
                    color rgbt <0.278, 0.282, 0.216, 0.000>]
    [0.983, 1.001   color rgbt <0.278, 0.282, 0.216, 0.000>
                    color rgbt <0.773, 0.647, 0.569, 0.000>]
   }
 }
 }

//------- Red Swirl
#declare T_Grnt28 =
texture {
pigment
 {marble
  turbulence 0.7
  color_map
   {[0.000, 0.155   color rgbt <0.686, 0.235, 0.282, 0.000>
                    color rgbt <0.686, 0.235, 0.282, 0.000>]
    [0.155, 0.328   color rgbt <0.686, 0.235, 0.282, 0.000>
                    color rgbt <0.494, 0.243, 0.294, 0.000>]
    [0.328, 0.474   color rgbt <0.494, 0.243, 0.294, 0.000>
                    color rgbt <0.769, 0.329, 0.373, 0.000>]
    [0.474, 0.647   color rgbt <0.769, 0.329, 0.373, 0.000>
                    color rgbt <0.769, 0.329, 0.373, 0.000>]
    [0.647, 0.810   color rgbt <0.769, 0.329, 0.373, 0.000>
                    color rgbt <0.686, 0.235, 0.282, 0.000>]
    [0.810, 0.922   color rgbt <0.686, 0.235, 0.282, 0.000>
                    color rgbt <0.792, 0.388, 0.427, 0.000>]
    [0.922, 1.001   color rgbt <0.792, 0.388, 0.427, 0.000>
                    color rgbt <0.686, 0.235, 0.282, 0.000>]
   }
 }
 finish {
  crand 0.03
 }
 }

//-------- White Tan & thin Reds
#declare T_Grnt29 =
texture {
pigment
 {marble
  turbulence 0.5
  color_map
   {[0.000, 0.053   color rgbt <0.784, 0.627, 0.522, 0.000>
                    color rgbt <0.784, 0.627, 0.624, 0.000>]
    [0.053, 0.263   color rgbt <0.784, 0.627, 0.624, 0.000>
                    color rgbt <0.824, 0.557, 0.376, 0.000>]
    [0.263, 0.281   color rgbt <0.824, 0.557, 0.376, 0.000>
                    color rgbt <0.643, 0.380, 0.376, 0.000>]
    [0.281, 0.325   color rgbt <0.643, 0.380, 0.376, 0.000>
                    color rgbt <0.839, 0.722, 0.722, 0.000>]
    [0.325, 0.711   color rgbt <0.839, 0.722, 0.722, 0.000>
                    color rgbt <0.784, 0.627, 0.522, 0.000>]
    [0.711, 0.798   color rgbt <0.784, 0.627, 0.522, 0.000>
                    color rgbt <0.769, 0.380, 0.376, 0.000>]
    [0.798, 0.895   color rgbt <0.769, 0.380, 0.376, 0.000>
                    color rgbt <0.824, 0.557, 0.376, 0.000>]
    [0.895, 0.982   color rgbt <0.824, 0.557, 0.376, 0.000>
                    color rgbt <0.784, 0.627, 0.522, 0.000>]
    [0.982, 1.001   color rgbt <0.784, 0.627, 0.522, 0.000>
                    color rgbt <0.784, 0.627, 0.522, 0.000>]
   }
 }
 }

//***************************************************************
//------------ start of textures with transmit

//----- Translucent T_Grnt0
#declare T_Grnt0a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.153   color rgbt <0.729, 0.502, 0.451, 0.306>
                    color rgbt <0.769, 0.686, 0.592, 0.792>]
    [0.153, 0.398   color rgbt <0.769, 0.686, 0.592, 0.792>
                    color rgbt <0.843, 0.753, 0.718, 0.396>]
    [0.398, 0.559   color rgbt <0.843, 0.753, 0.718, 0.396>
                    color rgbt <0.780, 0.667, 0.561, 0.976>]
    [0.559, 0.729   color rgbt <0.780, 0.667, 0.561, 0.976>
                    color rgbt <0.741, 0.659, 0.576, 0.820>]
    [0.729, 1.001   color rgbt <0.741, 0.659, 0.576, 0.820>
                    color rgbt <0.729, 0.502, 0.451, 0.306>]
   }
 }
 }

//----- Translucent T_Grnt1
#declare T_Grnt1a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.212   color rgbt <0.898, 0.898, 0.851, 0.306>
                    color rgbt <0.969, 0.980, 0.875, 0.792>]
    [0.212, 0.424   color rgbt <0.969, 0.980, 0.875, 0.792>
                    color rgbt <0.859, 0.859, 0.859, 0.396>]
    [0.424, 0.627   color rgbt <0.859, 0.859, 0.859, 0.396>
                    color rgbt <0.992, 0.922, 0.659, 0.976>]
    [0.627, 0.881   color rgbt <0.992, 0.922, 0.659, 0.976>
                    color rgbt <0.937, 0.965, 0.902, 0.820>]
    [0.881, 1.001   color rgbt <0.937, 0.965, 0.902, 0.820>
                    color rgbt <0.898, 0.898, 0.851, 0.306>]
   }
 }
 }

//-----Translucent T_Grnt2
#declare T_Grnt2a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.144   color rgbt <0.863, 0.757, 0.596, 0.596>
                    color rgbt <0.925, 0.792, 0.714, 0.349>]
    [0.144, 0.288   color rgbt <0.925, 0.792, 0.714, 0.349>
                    color rgbt <0.871, 0.702, 0.659, 0.784>]
    [0.288, 0.644   color rgbt <0.871, 0.702, 0.659, 0.784>
                    color rgbt <0.992, 0.922, 0.659, 0.498>]
    [0.644, 0.983   color rgbt <0.992, 0.922, 0.659, 0.498>
                    color rgbt <0.902, 0.812, 0.714, 0.722>]
    [0.983, 1.001   color rgbt <0.902, 0.812, 0.714, 0.722>
                    color rgbt <0.863, 0.757, 0.596, 0.596>]
   }
 }
 }

//-----Translucent T_Grnt3
#declare T_Grnt3a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.153   color rgbt <0.831, 0.631, 0.569, 0.447>
                    color rgbt <0.925, 0.831, 0.714, 0.678>]
    [0.153, 0.297   color rgbt <0.925, 0.831, 0.714, 0.678>
                    color rgbt <0.871, 0.702, 0.659, 0.475>]
    [0.297, 0.441   color rgbt <0.871, 0.702, 0.659, 0.475>
                    color rgbt <0.831, 0.631, 0.569, 0.918>]
    [0.441, 0.763   color rgbt <0.831, 0.631, 0.569, 0.918>
                    color rgbt <0.937, 0.882, 0.820, 0.655>]
    [0.763, 1.001   color rgbt <0.937, 0.882, 0.820, 0.655>
                    color rgbt <0.831, 0.631, 0.569, 0.447>]
   }
 }
 }

//-----Translucent T_Grnt4
#declare T_Grnt4a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.144   color rgbt <0.804, 0.569, 0.494, 0.569>
                    color rgbt <0.816, 0.725, 0.537, 0.467>]
    [0.144, 0.449   color rgbt <0.816, 0.725, 0.537, 0.467>
                    color rgbt <0.820, 0.580, 0.522, 0.584>]
    [0.449, 0.568   color rgbt <0.820, 0.580, 0.522, 0.584>
                    color rgbt <0.882, 0.725, 0.537, 0.871>]
    [0.568, 0.754   color rgbt <0.882, 0.725, 0.537, 0.871>
                    color rgbt <0.855, 0.729, 0.584, 0.816>]
    [0.754, 1.001   color rgbt <0.855, 0.729, 0.584, 0.816>
                    color rgbt <0.804, 0.569, 0.494, 0.569>]
   }
 }
 }

//-----Translucent T_Grnt5
#declare T_Grnt5a =
texture {
pigment
 {granite
  turbulence 0.5
  color_map
   {[0.000, 0.178   color rgbt <0.804, 0.569, 0.494, 0.569>
                    color rgbt <0.855, 0.729, 0.584, 0.467>]
    [0.178, 0.356   color rgbt <0.855, 0.729, 0.584, 0.467>
                    color rgbt <0.667, 0.502, 0.478, 0.584>]
    [0.356, 0.525   color rgbt <0.667, 0.502, 0.478, 0.584>
                    color rgbt <0.859, 0.624, 0.545, 0.871>]
    [0.525, 0.729   color rgbt <0.859, 0.624, 0.545, 0.871>
                    color rgbt <0.855, 0.729, 0.584, 0.816>]
    [0.729, 1.001   color rgbt <0.855, 0.729, 0.584, 0.816>
                    color rgbt <0.804, 0.569, 0.494, 0.569>]
   }
 }
 }

//-----Translucent T_Grnt6
#declare T_Grnt6a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.263   color rgbt <0.545, 0.380, 0.345, 0.733>
                    color rgbt <0.588, 0.475, 0.333, 0.741>]
    [0.263, 0.432   color rgbt <0.588, 0.475, 0.333, 0.741>
                    color rgbt <0.675, 0.478, 0.404, 0.545>]
    [0.432, 0.551   color rgbt <0.675, 0.478, 0.404, 0.545>
                    color rgbt <0.757, 0.635, 0.522, 0.384>]
    [0.551, 0.720   color rgbt <0.757, 0.635, 0.522, 0.384>
                    color rgbt <0.659, 0.549, 0.443, 0.675>]
    [0.720, 1.001   color rgbt <0.659, 0.549, 0.443, 0.675>
                    color rgbt <0.545, 0.380, 0.345, 0.733>]
   }
 }
 }

//-----Translucent T_Grnt7
#declare T_Grnt7a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.119   color rgbt <0.439, 0.310, 0.282, 0.631>
                    color rgbt <0.463, 0.369, 0.259, 0.847>]
    [0.119, 0.322   color rgbt <0.463, 0.369, 0.259, 0.847>
                    color rgbt <0.541, 0.369, 0.298, 0.549>]
    [0.322, 0.449   color rgbt <0.541, 0.369, 0.298, 0.549>
                    color rgbt <0.573, 0.424, 0.286, 0.965>]
    [0.449, 0.729   color rgbt <0.573, 0.424, 0.286, 0.965>
                    color rgbt <0.494, 0.396, 0.306, 0.741>]
    [0.729, 1.001   color rgbt <0.494, 0.396, 0.306, 0.741>
                    color rgbt <0.439, 0.310, 0.282, 0.631>]
   }
 }
 }

//-----Aqua Tints
#declare T_Grnt8a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.119   color rgbt <0.310, 0.384, 0.420, 0.631>
                    color rgbt <0.322, 0.369, 0.416, 0.847>]
    [0.119, 0.322   color rgbt <0.322, 0.369, 0.416, 0.847>
                    color rgbt <0.424, 0.369, 0.420, 0.549>]
    [0.322, 0.449   color rgbt <0.424, 0.369, 0.420, 0.549>
                    color rgbt <0.373, 0.424, 0.518, 0.965>]
    [0.449, 0.729   color rgbt <0.373, 0.424, 0.518, 0.965>
                    color rgbt <0.482, 0.573, 0.533, 0.741>]
    [0.729, 1.001   color rgbt <0.482, 0.573, 0.533, 0.741>
                    color rgbt <0.310, 0.384, 0.420, 0.631>]
   }
 }
 }

//-----Transmit Creams With T_Cracks
#declare T_Grnt9a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.216   color rgbt <0.812, 0.812, 0.812, 0.835>
                    color rgbt <0.745, 0.843, 0.835, 0.847>]
    [0.216, 0.241   color rgbt <0.745, 0.843, 0.835, 0.847>
                    color rgbt <0.404, 0.337, 0.337, 0.463>]
    [0.241, 0.267   color rgbt <0.404, 0.337, 0.337, 0.463>
                    color rgbt <0.773, 0.729, 0.745, 0.622>]
    [0.267, 0.759   color rgbt <0.773, 0.729, 0.745, 0.622>
                    color rgbt <0.914, 0.843, 0.725, 0.651>]
    [0.759, 0.784   color rgbt <0.914, 0.843, 0.725, 0.651>
                    color rgbt <0.153, 0.133, 0.208, 0.437>]
    [0.784, 0.810   color rgbt <0.153, 0.133, 0.208, 0.437>
                    color rgbt <0.812, 0.812, 0.812, 0.835>]
    [0.810, 1.001   color rgbt <0.812, 0.812, 0.812, 0.835>
                    color rgbt <0.812, 0.812, 0.812, 0.835>]
   }
 }
 }

//--------- Transmit Cream Rose & light yellow
#declare T_Grnt10a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.179   color rgbt <0.843, 0.655, 0.655, 0.455>
                    color rgbt <0.886, 0.769, 0.627, 0.608>]
    [0.179, 0.368   color rgbt <0.886, 0.769, 0.627, 0.608>
                    color rgbt <0.906, 0.820, 0.714, 0.392>]
    [0.368, 0.538   color rgbt <0.906, 0.820, 0.714, 0.392>
                    color rgbt <0.851, 0.671, 0.671, 0.659>]
    [0.538, 0.744   color rgbt <0.851, 0.671, 0.671, 0.659>
                    color rgbt <0.890, 0.792, 0.675, 0.392>]
    [0.744, 0.983   color rgbt <0.890, 0.792, 0.675, 0.392>
                    color rgbt <0.827, 0.612, 0.612, 0.706>]
    [0.983, 1.001   color rgbt <0.827, 0.612, 0.612, 0.706>
                    color rgbt <0.843, 0.655, 0.655, 0.455>]
   }
 }
 }

//--------- Transmit Light Grays
#declare T_Grnt11a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.154   color rgbt <0.894, 0.886, 0.886, 0.659>
                    color rgbt <0.745, 0.745, 0.753, 0.584>]
    [0.154, 0.308   color rgbt <0.745, 0.745, 0.753, 0.584>
                    color rgbt <0.902, 0.902, 0.859, 0.780>]
    [0.308, 0.444   color rgbt <0.902, 0.902, 0.859, 0.780>
                    color rgbt <0.729, 0.706, 0.694, 0.686>]
    [0.444, 0.615   color rgbt <0.729, 0.706, 0.694, 0.686>
                    color rgbt <0.588, 0.592, 0.635, 0.424>]
    [0.615, 0.803   color rgbt <0.588, 0.592, 0.635, 0.424>
                    color rgbt <0.608, 0.616, 0.659, 0.761>]
    [0.803, 1.001   color rgbt <0.608, 0.616, 0.659, 0.761>
                    color rgbt <0.894, 0.886, 0.886, 0.659>]
   }
 }
 }

//--------- Transmit Creams & Tans
#declare T_Grnt12a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.154   color rgbt <0.890, 0.690, 0.690, 0.659>
                    color rgbt <0.996, 0.835, 0.737, 0.659>]
    [0.154, 0.308   color rgbt <0.996, 0.835, 0.737, 0.659>
                    color rgbt <0.745, 0.635, 0.651, 0.780>]
    [0.308, 0.444   color rgbt <0.745, 0.635, 0.651, 0.780>
                    color rgbt <0.733, 0.596, 0.557, 0.686>]
    [0.444, 0.615   color rgbt <0.733, 0.596, 0.557, 0.686>
                    color rgbt <0.996, 0.835, 0.737, 0.659>]
    [0.615, 0.803   color rgbt <0.996, 0.835, 0.737, 0.659>
                    color rgbt <0.765, 0.616, 0.659, 0.761>]
    [0.803, 1.001   color rgbt <0.765, 0.616, 0.659, 0.761>
                    color rgbt <0.890, 0.690, 0.690, 0.659>]
   }
 }
 }

//--------- Transmit Creams & Grays
#declare T_Grnt13a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.154   color rgbt <0.800, 0.651, 0.557, 0.000>
                    color rgbt <0.996, 0.835, 0.737, 0.608>]
    [0.154, 0.308   color rgbt <0.996, 0.835, 0.737, 0.608>
                    color rgbt <0.800, 0.651, 0.557, 0.635>]
    [0.308, 0.444   color rgbt <0.800, 0.651, 0.557, 0.635>
                    color rgbt <0.694, 0.624, 0.604, 0.294>]
    [0.444, 0.615   color rgbt <0.694, 0.624, 0.604, 0.294>
                    color rgbt <0.800, 0.651, 0.557, 0.816>]
    [0.615, 0.812   color rgbt <0.800, 0.651, 0.557, 0.816>
                    color rgbt <0.725, 0.655, 0.651, 0.957>]
    [0.812, 1.001   color rgbt <0.725, 0.655, 0.651, 0.957>
                    color rgbt <0.800, 0.651, 0.557, 0.000>]
   }
 }
 }

//--------- Cream Rose & light moss
#declare T_Grnt14a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.154   color rgbt <0.996, 0.969, 0.800, 0.373>
                    color rgbt <0.996, 0.682, 0.604, 0.412>]
    [0.154, 0.308   color rgbt <0.996, 0.682, 0.604, 0.412>
                    color rgbt <0.906, 0.820, 0.714, 0.616>]
    [0.308, 0.444   color rgbt <0.906, 0.820, 0.714, 0.616>
                    color rgbt <0.816, 0.631, 0.537, 0.443>]
    [0.444, 0.615   color rgbt <0.816, 0.631, 0.537, 0.443>
                    color rgbt <0.890, 0.792, 0.675, 0.745>]
    [0.615, 0.812   color rgbt <0.890, 0.792, 0.675, 0.745>
                    color rgbt <0.973, 0.627, 0.627, 0.600>]
    [0.812, 1.001   color rgbt <0.973, 0.627, 0.627, 0.600>
                    color rgbt <0.996, 0.969, 0.800, 0.373>]
   }
 }
 }

//--------- Transmit Sand & light Orange
#declare T_Grnt15a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.154   color rgbt <0.996, 0.824, 0.780, 0.412>
                    color rgbt <0.996, 0.698, 0.624, 0.412>]
    [0.154, 0.308   color rgbt <0.996, 0.698, 0.624, 0.412>
                    color rgbt <0.906, 0.675, 0.553, 0.616>]
    [0.308, 0.444   color rgbt <0.906, 0.675, 0.553, 0.616>
                    color rgbt <0.996, 0.682, 0.604, 0.412>]
    [0.444, 0.615   color rgbt <0.996, 0.682, 0.604, 0.412>
                    color rgbt <0.996, 0.824, 0.780, 0.412>]
    [0.615, 0.812   color rgbt <0.996, 0.824, 0.780, 0.412>
                    color rgbt <0.973, 0.627, 0.627, 0.600>]
    [0.812, 1.001   color rgbt <0.973, 0.627, 0.627, 0.600>
                    color rgbt <0.996, 0.824, 0.780, 0.412>]
   }
 }
 }

//--------- Cream Rose & light moss
#declare T_Grnt16a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.078   color rgbt <0.769, 0.722, 0.690, 0.180>
                    color rgbt <0.745, 0.690, 0.655, 1.000>]
    [0.078, 0.96    color rgbt <0.745, 0.690, 0.655, 1.000>
                    color rgbt <0.839, 0.804, 0.780, 1.000>]
    [0.96, 1.001    color rgbt <0.839, 0.804, 0.780, 0.278>
                    color rgbt <0.769, 0.722, 0.690, 0.180>]
   }
 }
 }

#declare T_Grnt17a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.034   color rgbt <0.027, 0.012, 0.012, 0.000>
                    color rgbt <0.851, 0.812, 0.741, 0.235>]
    [0.034, 0.342   color rgbt <0.851, 0.812, 0.741, 0.235>
                    color rgbt <0.792, 0.694, 0.690, 0.839>]
    [0.342, 0.462   color rgbt <0.792, 0.694, 0.690, 0.839>
                    color rgbt <0.631, 0.506, 0.471, 0.608>]
    [0.462, 0.632   color rgbt <0.631, 0.506, 0.471, 0.608>
                    color rgbt <0.851, 0.812, 0.741, 0.922>]
    [0.632, 0.983   color rgbt <0.851, 0.812, 0.741, 0.922>
                    color rgbt <0.647, 0.655, 0.655, 0.282>]
    [0.983, 1.001   color rgbt <0.647, 0.655, 0.655, 0.282>
                    color rgbt <0.027, 0.012, 0.012, 0.000>]
   }
 }
 }

#declare T_Grnt18a =
texture {
pigment
 {granite
  turbulence 0.6
  color_map
   {[0.000, 0.128   color rgbt <0.820, 0.580, 0.580, 0.000>
                    color rgbt <0.851, 0.812, 0.741, 0.235>]
    [0.128, 0.282   color rgbt <0.851, 0.812, 0.741, 0.235>
                    color rgbt <0.792, 0.694, 0.690, 0.282>]
    [0.282, 0.393   color rgbt <0.792, 0.694, 0.690, 0.282>
                    color rgbt <0.647, 0.655, 0.655, 0.133>]
    [0.393, 0.590   color rgbt <0.647, 0.655, 0.655, 0.133>
                    color rgbt <0.851, 0.812, 0.741, 0.333>]
    [0.590, 0.983   color rgbt <0.851, 0.812, 0.741, 0.333>
                    color rgbt <0.647, 0.655, 0.655, 0.282>]
    [0.983, 1.001   color rgbt <0.647, 0.655, 0.655, 0.282>
                    color rgbt <0.820, 0.580, 0.580, 0.000>]
   }
 }
 }

//--------- Gray Marble with White feather Viens with Transmit
#declare T_Grnt19a =
texture {
pigment
 {granite
  turbulence 0.0
  color_map
   {[0.0, 0.3 color White transmit 0.0 color DimGray transmit 0.5]
    [0.3, 0.4 color DimGray transmit 0.5 color DimGray transmit 0.8]
    [0.4, 1.0 color DimGray transmit 0.8 color DimGray transmit 0.9]
   }
 }
 finish {
  crand 0.02
 }
 }

//--------- White Feature Viens
#declare T_Grnt20a =
texture {
pigment
 {granite
  turbulence 0.0
  color_map
   {[0.0, 0.2 color White transmit 0.0 color White transmit 0.7]
    [0.2, 0.3 color White transmit 0.7 color Clear]
    [0.3, 1.0 color Clear color Clear]
   }
 }
 finish {
  crand 0.02
 }
 }

//--------- Thinner White Feature Viens
#declare T_Grnt21a =
texture {
pigment
 {granite
  turbulence 0.0
  color_map
   {[0.0, 0.2 color White transmit 0.4 color White transmit 0.8]
    [0.2, 0.3 color White transmit 0.8 color Clear]
    [0.3, 1.0 color Clear color Clear]
   }
 }
 finish {
  crand 0.02
 }
 }

#declare T_Grnt22a =
texture {
pigment
 {granite
  turbulence 0.5
  color_map
   {[0.000, 0.175   color rgbt <1.000, 0.718, 0.541, 0.890>
                    color rgbt <0.843, 0.678, 0.655, 0.753>]
    [0.175, 0.228   color rgbt <0.843, 0.678, 0.655, 0.753>
                    color rgbt <0.906, 0.831, 0.773, 0.98>]
    [0.228, 0.386   color rgbt <0.906, 0.831, 0.773, 0.698>
                    color rgbt <0.992, 0.718, 0.545, 0.794>]
    [0.386, 0.412   color rgbt <0.992, 0.718, 0.545, 0.794>
                    color rgbt <0.333, 0.188, 0.067, 0.784>]
    [0.412, 0.439   color rgbt <0.333, 0.188, 0.067, 0.784>
                    color rgbt <0.925, 0.557, 0.514, 0.778>]
    [0.439, 0.684   color rgbt <0.925, 0.557, 0.514, 0.678>
                    color rgbt <0.984, 0.780, 0.655, 0.696>]
    [0.684, 0.781   color rgbt <0.984, 0.780, 0.655, 0.696>
                    color rgbt <0.965, 0.847, 0.675, 0.880>]
    [0.781, 0.982   color rgbt <0.965, 0.847, 0.675, 0.880>
                    color rgbt <1.000, 0.718, 0.541, 0.990>]
    [0.982, 1.001   color rgbt <1.000, 0.718, 0.541, 0.890>
                    color rgbt <1.000, 0.718, 0.541, 0.890>]
   }
 }
 }

//---------- Transparent Green Moss Colors
#declare T_Grnt23a =
texture {
pigment
 {granite
  color_map
   {[0.000, 0.168   color rgbt <0.824, 0.725, 0.584, 0.600>
                    color rgbt <0.514, 0.584, 0.533, 0.600>]
    [0.168, 0.301   color rgbt <0.514, 0.584, 0.533, 0.600>
                    color rgbt <0.298, 0.376, 0.318, 0.600>]
    [0.301, 0.398   color rgbt <0.298, 0.376, 0.318, 0.600>
                    color rgbt <0.263, 0.337, 0.282, 0.700>]
    [0.398, 0.558   color rgbt <0.263, 0.337, 0.282, 0.700>
                    color rgbt <0.431, 0.506, 0.451, 0.600>]
    [0.558, 0.655   color rgbt <0.431, 0.506, 0.451, 0.600>
                    color rgbt <0.529, 0.631, 0.471, 0.500>]
    [0.655, 0.735   color rgbt <0.529, 0.631, 0.471, 0.500>
                    color rgbt <0.333, 0.376, 0.318, 0.700>]
    [0.735, 0.823   color rgbt <0.333, 0.376, 0.318, 0.700>
                    color rgbt <0.298, 0.376, 0.318, 0.600>]
    [0.823, 0.876   color rgbt <0.298, 0.376, 0.318, 0.600>
                    color rgbt <0.416, 0.376, 0.318, 0.500>]
    [0.876, 0.929   color rgbt <0.416, 0.376, 0.318, 0.500>
                    color rgbt <0.416, 0.376, 0.318, 0.600>]
    [0.929, 1.001   color rgbt <0.416, 0.376, 0.318, 0.600>
                    color rgbt <0.824, 0.725, 0.584, 0.700>]
   }
 }
 }

#declare T_Grnt24a =
texture {
pigment
 {granite
  turbulence 0.5
  color_map
   {[0.000, 0.053   color rgbt <0.784, 0.627, 0.522, 0.500>
                    color rgbt <0.784, 0.627, 0.624, 0.500>]
    [0.053, 0.263   color rgbt <0.784, 0.627, 0.624, 0.500>
                    color rgbt <0.824, 0.557, 0.376, 0.500>]
    [0.263, 0.281   color rgbt <0.824, 0.557, 0.376, 0.500>
                    color rgbt <0.643, 0.380, 0.376, 0.500>]
    [0.281, 0.325   color rgbt <0.643, 0.380, 0.376, 0.500>
                    color rgbt <0.839, 0.722, 0.722, 0.500>]
    [0.325, 0.711   color rgbt <0.839, 0.722, 0.722, 0.500>
                    color rgbt <0.784, 0.627, 0.522, 0.500>]
    [0.711, 0.798   color rgbt <0.784, 0.627, 0.522, 0.500>
                    color rgbt <0.769, 0.380, 0.376, 0.500>]
    [0.798, 0.895   color rgbt <0.769, 0.380, 0.376, 0.500>
                    color rgbt <0.824, 0.557, 0.376, 0.500>]
    [0.895, 0.982   color rgbt <0.824, 0.557, 0.376, 0.500>
                    color rgbt <0.784, 0.627, 0.522, 0.500>]
    [0.982, 1.001   color rgbt <0.784, 0.627, 0.522, 0.500>
                    color rgbt <0.784, 0.627, 0.522, 0.500>]
   }
 }
 }

/*--------------------T_Crack & OverTint /Red---------------------*/
#declare T_Crack1 =
texture {
pigment
 {marble
  turbulence 0.85
  color_map
   {[0.0, 0.04 color Black transmit 0.6 color Black transmit 1.0]
    [0.04, 0.97 color Scarlet transmit 0.80 color DimGray transmit 0.90]
    [0.97, 1.001 color Black transmit 0.9 color Black transmit 1.0]
   }
 }
 }

//-----Transmit  Dark T_Cracks
#declare T_Crack2 =
texture {
pigment
 {granite
  turbulence 0.8
  color_map
   {[0.0, 0.5   color Clear color Clear]
    [0.5, 0.54   color Clear color Black]
    [0.54, 1.0 color Clear color Clear]
   }
 }
 }

//---------- Overtint Green with Black T_Cracks
#declare T_Crack3 =
texture {
pigment
 {marble
  turbulence 0.85
  color_map
   {[0.0, 0.04 color Black transmit 0.6 color Black transmit 1.0]
    [0.04, 0.97 color DarkGreen transmit 0.80 color DarkGreen transmit 0.90]
    [0.97, 1.001 color Black transmit 0.9 color Black transmit 1.0]
   }
 }
 }

//--------- Overtint with White T_Crack
#declare T_Crack4 =
texture {
pigment
 {marble
  turbulence 0.85
  color_map
   {[0.0, 0.03 color White transmit 0.3 color White transmit 1.0]
    [0.03, 0.97 color Black transmit 0.70 color DimGray transmit 0.90]
    [0.97, 1.001 color White transmit 0.9 color White transmit 1.0]
   }
 }
 }

//-----------------  complete texture statements
//                   Scaled to cover nicely over a 2 unit Cube

//------------- Deep Rose & Green Marble with large White Swirls
#declare T_Stone1 =
texture{T_Grnt7  scale <2, 3, 2> rotate <0, 0, 40>}
texture{T_Grnt0a scale <2, 3, 2> rotate <0, 0,-30>
        finish{phong 1 phong_size 90}
       }

//------------- Light Greenish Tan Marble with Agate style veining
#declare T_Stone2 =
texture{T_Grnt0  scale <2, 3, 2> rotate <0, 0, 40>}
texture{T_Grnt7a scale <1.3, 2, 1.3> rotate <0, 0, -30> rotate <40, 0, 0>
        finish{phong 1.0 phong_size 90 ambient 0.2 }
}

//------------- Rose & Yellow Marble with fog white veining
#declare T_Stone3 =
texture{T_Grnt5  scale <2, 3, 2> rotate <0, 0, 40>}
texture{T_Grnt0a scale <2, 3, 2> rotate <0, 0, -30>
        finish{phong 1.0 phong_size 90}
}

//------------- Tan Marble with Rose patches
#declare T_Stone4 =
texture{T_Grnt6   scale <1.5, 3, 2> rotate <0, 0, 40>
        finish{diffuse 0.5}
}
texture{T_Grnt10a scale <1, 3, 2> rotate <0, 0, -30>
        finish{phong 1.0 phong_size 90}
}

//------------- White Cream Marble with Pink veining
#declare T_Stone5 =
texture{T_Grnt12  scale <2, 3, 2> rotate <0, 0, 40>}
texture{T_Grnt17a scale <2, 3, 2> rotate <0, 0, -30>}
texture{T_Crack1  scale <1, 2, 1.4> rotate <10, 0, -20>
        finish{phong 1.0 phong_size 90 ambient 0.2}
}

//------------- Rose & Yellow Cream Marble
#declare T_Stone6 =
texture{T_Grnt18 scale <1.5, 3, 3> rotate <0, 0, 40>}
texture{T_Grnt19 scale <2, 4, 1.3> rotate <0, 0, 30>
        finish{phong 1.0 phong_size 90}
}
texture{T_Crack1 scale <1, 2, 1.4> rotate <10, 0, -20>
        finish{phong 1.0 phong_size 90 ambient 0.2}
}

//------------- Light Coffee Marble with darker patches
#declare T_Stone7 =
texture{pigment{color Salmon}}
texture{T_Grnt6a scale <1, 3, 2> rotate <0, 0, 40>}
texture{T_Grnt9a scale <3.5, 5, 4> rotate <0, 0, 60>
        finish{phong 1.0 phong_size 90}
}

//------------- Gray Granite with white patches
#declare T_Stone8 =
texture{pigment{color White}
        finish{ambient 0.4 crand 0.06 diffuse 0.7}
}
texture{T_Grnt0a scale <2, 3, 2> rotate <0, 0, -30>}
texture{T_Grnt9a scale <5, 3, 4> rotate <0, 0, 40>
        finish{phong 1.0 ambient 0.2 diffuse 0.5 phong_size 90}
}

//------------- White & Light Blue Marble with light violets
#declare T_Stone9 =
texture{T_Grnt9 scale <1.2, 2.4, 1.2> rotate <0, 0, -30> rotate <40, 0, 0>}
texture{T_Crack1 scale <1, 2, 1.4> rotate <10, 0, -20>
        finish{phong 1.0 phong_size 90 ambient 0.2}
}

//------------- Dark Brown & Tan swirl Granite with gray undertones
#declare T_Stone10 =
texture{pigment{color Black}}
texture{T_Grnt17a scale <3, 6, 2> rotate <0, 0, 50>}
texture{T_Grnt3a scale <1, 2, 1> rotate <0, 0, -50>
        finish{phong 1.0 phong_size 90}
}

//------------- Rose & White Marble with dark tan swirl
#declare T_Stone11 =
texture{pigment{color Black}}
texture{T_Grnt15a scale <1.2, 3, 1.5> rotate <70, 0, 30>
        finish{crand 0.03}
}
texture{T_Grnt2a scale <3, 3, 4> rotate <0, 0, 40>}
texture{T_Crack1 scale <1, 2, 1.4> rotate <10, 0, -20>
        finish{phong 1.0 phong_size 90}
}

//------------- White & Pinkish Tan Marble
#declare T_Stone12 =
texture{T_Grnt23 scale <1, 5, 1> rotate <0, 0, 50>
        finish{ambient 0.2 crand 0.03}
}
texture{T_Grnt0a scale <1, 3, 2> rotate <0, 0, -30>
        finish{phong 1.0 phong_size 90}
}

//------------- Medium Gray Blue Marble
#declare T_Stone13 =
texture{T_Grnt24 scale <2, 5, 2> rotate <0, 0, 50>
        finish{ambient 0.2 crand 0.03}
}
texture{T_Grnt8a scale <1, 3, 2> rotate <0, 0, -30>
        finish{phong 1.0 phong_size 90}
}

//------------- Tan & Olive Marble with gray white veins
#declare T_Stone14 =
texture{T_Grnt6 scale <2, 3, 2> rotate <0, 0, -30>
        finish{ambient 0.2 diffuse 0.9 crand 0.03}
}
texture{T_Grnt19a scale <1, 3, 1> rotate <0, 0, 40>
        finish{phong 1.0 phong_size 90}
}

//------------- Deep Gray Marble with white veining
#declare T_Stone15 =
texture{T_Grnt20 scale <1, 2, 2> rotate <0, 0, -30>
        finish{ambient 0.2 diffuse 0.9 crand 0.03}
}
texture{T_Grnt8a scale <1, 2, 1> rotate <0, 0, 40>
        finish{phong 1.0 phong_size 90}
}

//------------- Peach & Yellow Marble with white veining
#declare T_Stone16 =
texture{T_Grnt18 scale <1.3, 2, 2> rotate <0, 0, -30>
        finish{ambient 0.2 diffuse 0.9 crand 0.03}
}
texture{T_Grnt19 scale <2, 4, 2> rotate <0, 0, -30>
        finish{ambient 0.2 diffuse 0.9 crand 0.03}
}
texture{T_Grnt20a scale <1, 2, 1> rotate <0, 0, 40>
        finish{phong 1.0 phong_size 90}
}

//------------- White Marble with gray veining
#declare T_Stone17 =
texture{T_Grnt20 scale <1, 2, 2> rotate <0, 0, -30>
        finish{ambient 0.2 diffuse 0.9 crand 0.03}
}
//texture{T_Grnt8a scale <2.5, 4.5, 3.5> rotate <0, 0, 40>
//        finish{phong 1.0 phong_size 90}
//}
texture{T_Crack3 scale <1, 2, 1.4> rotate <10, 0, -20>
        finish{phong 1.0 phong_size 90}
}

//------------- Green Jade with white veining
#declare T_Stone18 =
texture{pigment{color SeaGreen}
        finish{ambient 0.3 diffuse 0.6 crand 0.03}
}
texture{T_Grnt22 scale <1.5, 0.7, 0.5> rotate <0, 0, 40>}
texture{T_Grnt20a scale <2.5, 2, 0.5> rotate <0, 0, -50>}
texture{T_Crack4 scale <0.7, 1, 1> rotate <10, 0, -20>
        finish{phong 1.0 phong_size 90}
}

//------------- Peach Granite with white patches & green trim
#declare T_Stone19 =
texture{T_Grnt26 scale <1, 0.7, 0.5> rotate <0, 0, 40>}
texture{T_Grnt20a scale <2, 3, 1> rotate <10, 0, -20>
        finish{phong 1.0 phong_size 90}
}

//------------- Brown & Olive Marble with white veining
#declare T_Stone20 =
texture{T_Grnt27 scale <0.7, 0.99, 0.7> rotate <0, 0, 40>}
texture{T_Grnt12a scale <1, 1.3, 2> rotate <0, 0, 40>}
texture{T_Grnt20a scale <1.9, 3, 0.5> rotate <0, 0, -50>}
texture{T_Crack1 scale <1, 0.6, 1> rotate <10, 0, -20>
        finish{phong 1.0 phong_size 90}
}

//------------- Red Marble with gray & white veining
#declare T_Stone21 =
texture{T_Grnt28 scale <1.3, 2.5, 1.7> rotate <0, 0, 40>}
texture{T_Grnt22 scale <1, 2, 2> rotate <0, 0, 40>}
texture{T_Crack4 scale <1, 0.6, 1> rotate <10, 0, -20>
        finish{phong 1.0 phong_size 90}
}

//------------- Dark Tan Marble with gray & white veining
#declare T_Stone22 =
texture{pigment{color Feldspar}}
texture{T_Grnt8a scale <1, 2, 2> rotate <0, 0, 40>}
texture{T_Grnt22 scale <2, 4, 1.5> rotate <0, 0, -50>}
texture{T_Crack4 scale <1, 1, 1> rotate <10, 0, -40>
        finish{phong 1.0 phong_size 90}
}

//------------- Peach & Cream Marble with orange veining
#declare T_Stone23 =
texture{T_Grnt29 scale <1, 1, 2> rotate <40, 0, 0> rotate <0, 0, 30>}
texture{T_Grnt24a scale <2, 1, 2> rotate <40, 0, 0> rotate <0, 0, 30>}
texture{T_Crack1 scale <1, 2, 1.5> rotate <0, 0, 40>}
texture{pigment{color Yellow transmit 0.9}
        finish{phong 1.0 phong_size 90}  // tint to liking
}

//------------- Green & Tan Moss Marble
#declare T_Stone24 =
texture{T_Grnt25 scale <1, 1, 2> rotate <0, 0, 50> rotate <20, 0, 30>}
texture{T_Grnt23a scale <2, 1, 2> rotate <40, 0, 0> rotate <0, 0, -30>}
texture{pigment{color Gray transmit 0.8}
        finish{phong 1.0 phong_size 90} //   tint to liking
}


#version Stones1_Inc_Temp;
#end
`,
    'stones2.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: stones2.inc
//    Last updated: 2001.7.24
//    Description: Stone textures.

#ifndef(Stones2_Inc_Temp)
#declare Stones2_Inc_Temp = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
    #debug "including stones2.inc\\n"
#end

/* This file was modified July 2001 to work as it should with POV-Ray 3.5,
   all filters being changed to transmits*/

/*

              Persistence of Vision Raytracer Version 3.1
       T_Stone25 through T_Stone35 created by Dan Farmer, 1995
       T_Stone36 through T_Stone43 created by Paul Novak, 1995
       T_Stone44 by Dan Farmer 1995

*/

#declare T_Stone25 =
texture {
    pigment {
        crackle
        turbulence 0.3
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.45
        rotate <0, 5, 60>
        color_map {
            [0.02 color rgbt <0.30, 0.60, 0.45, 0.0> ]
            [0.06 color rgbt <0.35, 0.55, 0.40, 0.0> ]
            [0.10 color rgbt <0.25, 0.25, 0.20, 0.0> ]
            [1.00 color rgbt <0.75, 0.75, 0.60, 0.0> ]
        }
    }
}

texture {
    pigment {
        crackle
        turbulence 0.2
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.65
        rotate <0, 45, 60>
        color_map { 
            [0.02 color rgbt <0.30, 0.60, 0.45, 0.95> ]
            [0.06 color rgbt <0.35, 0.55, 0.40, 0.75> ]
            [0.10 color rgbt <0.25, 0.25, 0.20, 0.65> ]
            [1.00 color rgbt <0.75, 0.75, 0.60, 0.60> ]
        }
    }
}

texture {
    pigment {
        crackle
        turbulence 0.2
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.15
        rotate <30, 30, 30>
        color_map {
            [0.00 color rgbt <0.95, 0.95, 0.95, 0.30> ]
            [0.03 color rgbt <0.85, 0.85, 0.85, 0.60> ]
            [0.06 color rgbt <0.50, 0.50, 0.50, 0.90> ]
            [0.10 color rgbt <1.00, 1.00, 1.00, 1.00> ]
        }
    }
}

#declare T_Stone26 =
texture {
    pigment {
        granite
        rotate y*90
        color_map { 
            [0.02 color rgbt <0.25, 0.45, 0.60, 0.0> ]
            [0.06 color rgbt <0.20, 0.40, 0.55, 0.0> ]
            [0.10 color rgbt <0.15, 0.20, 0.25, 0.0> ]
            [1.00 color rgbt <0.40, 0.60, 0.75, 0.0> ]
        }
        frequency 6
        rotate <0, 10, 0>
        turbulence <0.05, 0.05, 0.05>
        octaves 6
        omega 0.7
        lambda 2
    }
}
texture {
    pigment {
        gradient x
        color_map {
            [0.00 color Clear ]
            [0.10 color rgbt <1.00, 1.00, 1.00, 0.75> ]
            [0.15 color rgbt <0.15, 0.25, 0.40, 0.50> ]
            [0.20 color rgbt <0.00, 0.05, 0.10, 0.25> ]
            [0.25 color rgbt <0.15, 0.25, 0.40, 0.25> ]
            [0.30 color rgbt <0.35, 0.55, 0.40, 0.50> ]
            [0.35 color rgbt <0.25, 0.25, 0.20, 0.75> ]
            [0.35 color Clear ]
        }
        frequency 3
        rotate <1, 10, 45>
        rotate x*60
        turbulence <0.30, 0.30, 0.30>
        octaves 6
        omega 0.7
        lambda 2.2
    }
}
texture {
    pigment {
        agate
        color_map {
            [0.00 color Clear ]
            [0.10 color rgbt <1.00, 1.00, 1.00, 0.75> ]
            [0.15 color rgbt <0.35, 0.55, 0.40, 0.50> ]
            [0.20 color rgbt <0.25, 0.25, 0.20, 0.25> ]
            [0.25 color rgbt <0.30, 0.60, 0.45, 0.25> ]
            [0.30 color rgbt <0.35, 0.55, 0.40, 0.50> ]
            [0.35 color rgbt <0.25, 0.25, 0.20, 0.75> ]
            [0.35 color Clear ]
        }
        frequency 3
        rotate <2, 10, 75>
        rotate x*120
        turbulence <0.05, 0.05, 0.05>
        octaves 6
        omega 0.7
        lambda 2
    }
}

#declare T_Stone27 =
texture {
    pigment {
        crackle
        turbulence 0.35
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.5
        frequency 3
        rotate <0, -45, 30>
        color_map { 
            [0.02 color rgbt <0.25, 0.45, 0.60, 0.0> ]
            [0.06 color rgbt <0.20, 0.40, 0.55, 0.0> ]
            [0.10 color rgbt <0.05, 0.10, 0.15, 0.0> ]
            [1.00 color rgbt <0.40, 0.60, 0.75, 0.0> ]
        }
    }
}

texture {
    pigment {
        crackle
        turbulence 0.1
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.45
        frequency 1
        phase 0.25
        rotate <0, 45, 60>
        color_map { 
            [0.00 color Clear ]
            [0.20 color rgbt <1.00, 1.00, 1.00, 0.75> ]
            [0.25 color rgbt <0.25, 0.45, 0.40, 0.50> ]
            [0.30 color rgbt <0.00, 0.00, 0.00, 0.00> ]
            [0.35 color rgbt <0.15, 0.75, 0.60, 0.50> ]
            [0.40 color rgbt <0.35, 0.85, 0.40, 0.60> ]
            [0.45 color rgbt <0.35, 0.45, 0.20, 0.75> ]
            [0.65 color Clear ]
        }
    }
}
texture {
    pigment {
        crackle
        turbulence 0.35
        lambda 2.5
        omega 0.75
        octaves 5
        scale 2
        frequency 2
        rotate <0, 90, 0>
        color_map { 
            [0.00 color Clear ]
            [0.20 color rgbt <1.00, 1.00, 1.00, 0.75> ]
            [0.25 color rgbt <0.35, 0.55, 0.40, 0.50> ]
            [0.30 color rgbt <0.00, 0.00, 0.00, 0.00> ]
            [0.45 color rgbt <0.30, 0.60, 0.45, 0.25> ]
            [0.50 color rgbt <0.35, 0.55, 0.40, 0.50> ]
            [0.65 color rgbt <0.25, 0.25, 0.20, 0.75> ]
            [0.65 color Clear ]
        }
    }
}


#declare T_Stone28 =
texture {
    pigment {
        agate
        agate_turb 0.75
        frequency 6
        scale 0.5
        rotate <0, -45, 5>
        color_map { 
            [0.02 color rgbt <0.65, 0.45, 0.25, 0.0> ]
            [0.06 color rgbt <0.55, 0.40, 0.20, 0.0> ]
            [0.10 color rgbt <0.15, 0.10, 0.05, 0.0> ]
            [1.00 color rgbt <0.75, 0.60, 0.40, 0.0> ]
        }
    }
}
texture {
    pigment {
        crackle
        turbulence 0.1
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.75
        frequency 1
        phase 0.25
        rotate <0, 45, 60>
        color_map { 
            [0.00 color Clear ]
            [0.25 color rgbt <0.40, 0.25, 0.15, 0.50> ]
            [0.30 color rgbt <0.00, 0.00, 0.00, 0.00> ]
            [0.35 color rgbt <0.40, 0.25, 0.15, 0.50> ]
            [0.40 color rgbt <0.45, 0.55, 0.35, 0.60> ]
            [0.65 color Clear ]
        }
    }
}
texture {
    pigment {
        crackle
        turbulence 0.1
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.45
        frequency 2
        phase 0.25
        rotate <0, 5, 60>
        color_map { 
            [0.00 color Clear ]
            [0.25 color rgbt <0.65, 0.25, 0.40, 0.50> ]
            [0.30 color rgbt <0.00, 0.00, 0.00, 0.00> ]
            [0.45 color rgbt <0.50, 0.60, 0.35, 0.25> ]
            [0.50 color rgbt <0.65, 0.25, 0.40, 0.50> ]
            [0.65 color Clear ]
        }
    }
}


#declare T_Stone29 =
texture {
    pigment {
        gradient x
        turbulence 0.75
        frequency 6
        scale 0.5
        rotate <0, -45, 30>
        color_map {
            [0.02 color rgb <0.65, 0.35, 0.25> ]
            [0.06 color rgb <0.55, 0.25, 0.10> ]
            [0.10 color rgb <0.45, 0.30, 0.25> ]
            [1.00 color rgb <0.65, 0.35, 0.25> ]
        }
    }
}
texture {
    pigment {
        crackle
        turbulence 0.6
        lambda 1.75
        omega 0.55
        octaves 4
        scale 0.45
        rotate <0, 5, 60>
        color_map { 
            [0.01 color rgbt <0.00, 0.00, 0.00, 0.00> ]
            [0.02 color rgbt <0.40, 0.25, 0.15, 0.20> ]
            [0.05 color rgbt <0.40, 0.35, 0.20, 0.40> ]
            [0.10 color rgbt <0.45, 0.55, 0.25, 0.60> ]
            [0.65 color Clear ]
        }
    }
}
texture {
    pigment {
        granite
        turbulence 0.1
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.75
        frequency 1
        phase 0.25
        rotate <0, 45, 60>
        color_map {
            [0.15 color rgbt <0.40, 0.25, 0.15, 0.40> ]
            [0.20 color rgbt <0.20, 0.10, 0.00, 0.00> ]
            [0.25 color rgbt <0.20, 0.15, 0.15, 0.40> ]
            [0.30 color rgbt <0.40, 0.25, 0.15, 0.70> ]
            [0.65 color Clear ]
        }
    }
}

#declare T_Stone30 =
texture {
    pigment {
        gradient x
        turbulence 0.75
        frequency 6
        scale 0.5
        rotate <0, -45, 30>
        color_map { 
            [0.02 color rgbt <0.85, 0.85, 0.45, 0.0> ]
            [0.06 color rgbt <0.65, 0.65, 0.40, 0.0> ]
            [0.10 color rgbt <0.90, 0.90, 0.65, 0.0> ]
            [1.00 color rgbt <0.85, 0.85, 0.45, 0.0> ]
        }
    }
}
texture {
    pigment {
        crackle
        turbulence 0.3
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.45
        frequency 2
        phase 0.25
        rotate <0, 5, 60>
        color_map { 
            [0.00 color Clear ]
            [0.25 color rgbt <0.40, 0.40, 0.15, 0.50> ]
            [0.30 color rgbt <0.00, 0.00, 0.00, 0.00> ]
            [0.35 color rgbt <0.40, 0.40, 0.20, 0.50> ]
            [0.40 color rgbt <0.65, 0.65, 0.30, 0.60> ]
            [0.65 color Clear ]
        }
    }
}

texture {
    pigment {
        crackle
        turbulence 0.1
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.75
        frequency 1
        phase 0.25
        rotate <0, 45, 60>
        color_map { 
            [0.00 color Clear ]
            [0.15 color rgbt <0.40, 0.15, 0.45, 0.60> ]
            [0.18 color rgbt <0.20, 0.10, 0.00, 0.00> ]
            [0.25 color rgbt <0.20, 0.15, 0.45, 0.60> ]
            [0.30 color rgbt <0.40, 0.15, 0.45, 0.80> ]
            [0.65 color Clear ]
        }
    }
}

#declare T_Stone31 =
texture {
    pigment {
        crackle
        turbulence 0.3
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.45
        rotate <0, 5, 60>
        color_map { 
            [0.00 color Gray90 ]
            [0.02 color rgb <0.95, 0.90, 0.85> ]
            [0.03 color rgb <0.75, 0.85, 0.80> ]
            [0.04 color rgb <0.45, 0.40, 0.50> ]
            [0.10 color Gray15 ]
        }
    }
}
texture {
    pigment {
        crackle
        turbulence 0.2
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.65
        rotate <0, 45, 60>
        color_map { 
            [0.00 color Clear ]
            [0.02 color rgb <0.95, 0.90, 0.85> ]
            [0.03 color rgb <0.75, 0.85, 0.80> ]
            [0.04 color rgb <0.45, 0.40, 0.50> ]
            [0.10 color Clear ]
        }
    }
}

#declare T_Stone32 =
texture {
    pigment {
        crackle
        turbulence 0.3
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.45
        rotate <0, 5, 60>
        color_map { 
            [0, 1 color rgb <0.9, 0.75, 0.75>
                  color rgb <0.6, 0.6, 0.6> ]
        }
    }
}

texture {
    pigment {
        crackle
        turbulence 0.2
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.65
        rotate <0, 45, 60>
        color_map { 
            [0.0, 0.9 color rgbt <0.52, 0.39, 0.39, 1.0> 
                      color rgbt <0.52, 0.39, 0.39, 0.5>]
            [0.9, 1.0 color rgbt <0.42, 0.14, 0.55, 0.0>
                      color rgbt <0.42, 0.14, 0.55, 0.0>]
        }
    }
}

texture {
    pigment {
        crackle
        turbulence 0.2
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.15
        rotate <30, 30, 30>
        color_map {
            [0.00 color rgbt <0.95, 0.95, 0.95, 0.30> ]
            [0.03 color rgbt <0.85, 0.85, 0.85, 0.60> ]
            [0.06 color rgbt <0.50, 0.50, 0.50, 0.90> ]
            [0.10 color rgbt <1.00, 1.00, 1.00, 1.00> ]
        }
    }
}

#declare T_Stone33 =
texture {
    pigment {
        crackle
        turbulence 0.3
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.45
        rotate <0, 5, 60>
        color_map {
            [0.0, 0.1 color rgb <0.0, 0.0, 0.0>
                      color rgb <0.9, 0.7, 0.6>]
            [0.1, 0.3 color rgb <0.9, 0.7, 0.6>
                      color rgb <0.9, 0.7, 0.4>]
            [0.3, 1.0 color rgb <0.9, 0.7, 0.4>
                      color rgb <0.7, 0.4, 0.2>]
        }
    }
}
texture {
    pigment {
        crackle
        turbulence 0.2
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.65
        rotate <0, 45, 60>
        color_map {
            [0.0, 0.2 color rgbt <0.7, 0.4, 0.2, 0.20>
                      color rgbt <0.9, 0.7, 0.6, 0.30>]
            [0.2, 0.3 color rgbt <0.9, 0.7, 0.6, 0.50>
                      color rgbt <0.9, 0.7, 0.4, 0.70>]
            [0.3, 1.0 color rgbt <0.9, 0.7, 0.4, 0.80>
                      color rgbt <0.7, 0.4, 0.2, 0.80>]
        }
    }
}

#declare T_Stone34 =
texture {
    pigment {
        gradient x
        turbulence 0.75
        frequency 6
        scale 0.5
        rotate <0, -45, 30>
        color_map {
            [0.02 color rgbt <0.85, 0.85, 0.85, 0.0> ]
            [0.10 color rgbt <1.00, 1.00, 1.00, 0.0> ]
            [1.00 color rgbt <0.85, 0.85, 0.85, 0.0> ]
        }
    }
}
texture {
    pigment {
        crackle
        turbulence 0.3
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.45
        frequency 2
        phase 0.25
        rotate <0, 5, 60>
        color_map {
            [0.00 color Clear ]
            [0.15 color rgbt <0.40, 0.30, 0.30, 0.50> ]
            [0.30 color rgbt <0.15, 0.08, 0.02, 0.00> ]
            [0.35 color rgbt <0.60, 0.40, 0.35, 0.50> ]
            [0.45 color rgbt <0.40, 0.35, 0.30, 0.60> ]
            [0.65 color Clear ]
        }
    }
}

// White marble
#declare T_Stone35 =
texture {
    pigment {
        gradient x
        turbulence 0.75
        frequency 6
        scale 0.5
        rotate <0, -45, 30>
        color_map {
            [0.02 color rgbt <0.85, 0.85, 0.85, 0.0> ]
            [0.10 color rgbt <1.00, 1.00, 1.00, 0.0> ]
            [1.00 color rgbt <0.85, 0.85, 0.85, 0.0> ]
        }
    }
}
texture {
    pigment {
        crackle
        turbulence 0.3
        lambda 2.5
        omega 0.75
        octaves 5
        scale 0.45
        frequency 2
        phase 0.25
        rotate <0, 5, 60>
        color_map {
            [0.00 color Clear ]
            [0.15 color rgbt <0.40, 0.30, 0.30, 0.50> ]
            [0.30 color rgbt <0.15, 0.08, 0.02, 0.00> ]
            [0.35 color rgbt <0.60, 0.40, 0.35, 0.50> ]
            [0.45 color rgbt <0.40, 0.35, 0.30, 0.60> ]
            [0.65 color Clear ]
        }
    }
}

// Creamy coffee w/greenish-grey veins & faint avacado swirls
#declare T_Stone36 =
texture  {
    pigment {
        granite
        turbulence 0.815
        colour_map {
            [0.10 colour rgbt <0.43529, 0.49804, 0.32941,0.0>]
            [0.20 colour rgbt <0.19608, 0.27843, 0.19608,0.0>]
            [0.35 colour rgbt <0.43529, 0.49804, 0.32941,0.0>]
            [0.55 colour rgbt <0.45490, 0.44706, 0.20784,0.0>]
            [0.75 colour rgbt <0.43529, 0.49804, 0.32941,0.0>]
            [0.90 colour rgbt <0.19608, 0.22745, 0.00000,0.0>]
            [1.00 colour rgbt <0.43529, 0.49804, 0.32941,0.0>]
        }
    scale <0.85, 1.5, 0.5>
    rotate <10, 0, 40>
    }
    finish { brilliance 1.825 }
}
texture  {
    pigment {
        granite
        turbulence 0.825
        colour_map {
            [0.18 colour rgbt <0.20784, 0.13333, 0.00000, 0.427>]
            [0.35 colour rgbt <0.20784, 0.13333, 0.00000, 0.735>]
            [0.45 colour rgbt <0.27059, 0.11373, 0.00000, 0.625>]
            [0.90 colour rgbt <0.27059, 0.11373, 0.00000, 0.875>]
            [1.00 colour rgbt <0.20784, 0.13333, 0.00000, 0.890>]
        }
     scale <0.65, 1.18, 0.34>
     rotate <5, 10, -55>
    }
    finish { ambient 0.275 diffuse 0.775 crand 0.01975 }
}

// Olive greens w/lighter swirls & hints of salmon
#declare T_Stone37 =
texture  {
    pigment {
        granite
        turbulence 0.9
        colour_map  {
            [0.18 colour rgbt <0.29020, 0.24706, 0.00000,0>]
            [0.35 colour rgbt <0.29020, 0.24706, 0.00000,0>]
            [0.45 colour rgbt <0.16471, 0.15294, 0.00000,0>]
            [0.90 colour rgbt <0.16471, 0.15294, 0.00000,0>]
            [1.00 colour rgbt <0.32941, 0.25882, 0.00000,0>]
        }
        scale <0.825, 1.7, 0.25>
        rotate <10,5,40>
    }
    finish { brilliance 2.5 }
}
texture  {
    pigment {
        granite
        turbulence 0.85
        colour_map   {
            [0.05 colour rgbt <0.86275, 0.65490, 0.40392, 0.6250>]
            [0.35 colour rgbt <0.48627, 0.16471, 0.00000, 0.8250>]
            [0.60 colour rgbt <0.86275, 0.65490, 0.40392, 0.7150>]
            [0.85 colour rgbt <0.48627, 0.16471, 0.00000, 0.5450>]
            [1.00 colour rgbt <0.52941, 0.34118, 0.17647, 0.8975>]
        }
        scale <0.85, 1.6, 0.45>
        rotate <0,5,-50>
    }
    finish { ambient 0.275 diffuse 0.6925 crand 0.01975}
}

// Deep rich coffee w/darker veins & lots of creamy swirl
#declare T_Stone38 =
texture  {
    pigment {
        granite
        turbulence 1.25
        colour_map  {
            [0.15 colour rgbt<0.72549, 0.73725, 0.54118, 0.0>]
            [0.25 colour rgbt<0.22745, 0.14510, 0.00000, 0.0>]
            [0.45 colour rgbt<0.72549, 0.73725, 0.54118, 0.0>]
            [0.60 colour rgbt<0.22745, 0.14510, 0.00000, 0.0>]
            [0.80 colour rgbt<0.22745, 0.14510, 0.00000, 0.0>]
            [1.00 colour rgbt<0.60392, 0.61176, 0.46667, 0.0>]
        }
        scale <0.95, 1.7, 0.39>
        rotate <10, 5, 40>
    }
    finish { brilliance 2.125 }
}
texture  {
    pigment {
        granite
        turbulence 0.825
        colour_map {
            [0.35 colour rgbt <0.56078, 0.54902, 0.42353,0.65>]
            [0.65 colour rgbt <0.10196, 0.05882, 0.00000,0.85>]
            [1.00 colour rgbt <0.56078, 0.54902, 0.42353,0.90>]
        }
        scale <0.76, 1.4, 0.4>
        rotate <0, 10, -55>
    }
    finish { ambient 0.4 diffuse 0.575 crand 0.021 }
}
// Light mauve w/large plum swirls
#declare T_Stone39 =
texture  {
    pigment {
        granite
        turbulence 0.825
        colour_map  {
             [0.12 colour rgbt <0.78039, 0.54902, 0.46667, 0.0>]
             [0.35 colour rgbt <0.78039, 0.54902, 0.46667, 0.0>]
             [0.65 colour rgbt <0.49804, 0.30980, 0.30196, 0.0>]
             [0.90 colour rgbt <0.49804, 0.30980, 0.30196, 0.0>]
             [1.00 colour rgbt <0.35294, 0.09020, 0.00000, 0.0>]
        }
    }
    scale <0.78,1.45, 0.4>
    rotate <5,10,-55>
    finish { brilliance 1.9275 ambient .3 diffuse .575 crand .0215}
}

// Creamy aqua w/green hi-lites & subtle hints of grey
#declare T_Stone40 =
texture  {
    pigment {
        agate
        agate_turb 1.1
        colour_map  {
            [0.10 colour rgbt <0.56078, 0.67451, 0.62353, 0.0>]
            [0.35 colour rgbt <0.27843, 0.41569, 0.30196, 0.0>]
            [0.55 colour rgbt <0.56078, 0.67451, 0.62353, 0.0>]
            [0.85 colour rgbt <0.56078, 0.67451, 0.62353, 0.0>]
            [0.95 colour rgbt <0.27843, 0.41569, 0.30196, 0.0>]
            [1.00 colour rgbt <0.54118, 0.58039, 0.56078, 0.0>]
        }
        scale <0.97, 0.97, 0.5>
        rotate <0, 5, 40>
    }
    finish {brilliance 1.25}
}
texture  {
    pigment {
        granite
        turbulence 1.25
        colour_map  {
            [0.15 colour rgbt <0.46667, 0.59216, 0.54118, 0.005>]
            [0.65 colour rgbt <0.35294, 0.67451, 0.54902, 0.750>]
            [0.80 colour rgbt <0.46667, 0.59216, 0.54118, 0.660>]
            [1.00 colour rgbt <0.35294, 0.67451, 0.54902, 0.879>]
        }
        scale <0.85, 1.5, 0.5>
        rotate <10, 5, -75>
    }
    finish { ambient 0.175 diffuse 0.6975 crand 0.025 }
}

// Dark powder blue w/steel blue & grey swirls
#declare T_Stone41 =
texture  {
    pigment {
        marble
        turbulence 1.5
        omega 0.6235
        lambda 2.25
        colour_map  {
            [0.15 colour rgbt <0.03922, 0.20784, 0.52941, 0.0>]
            [0.45 colour rgbt <0.03922, 0.20784, 0.52941, 0.0>]
            [0.55 colour rgbt <0.22745, 0.23922, 0.42353, 0.0>]
            [0.75 colour rgbt <0.20784, 0.30980, 0.54118, 0.0>]
            [1.00 colour rgbt <0.20784, 0.30980, 0.54118, 0.0>]
        }
        rotate <0, 0, 85>
        scale <0.75, 1.33, 0.35>
        rotate <10, 5, 45>
    }
    finish { brilliance 1.825 }
}
texture  {
    pigment {
        granite
        turbulence  1.15
        colour_map  {
            [0.25 colour rgbt <0.30196, 0.35294, 0.48627, 0.600>]
            [0.45 colour rgbt <0.30196, 0.35294, 0.48627, 0.475>]
            [0.85 colour rgbt <0.17647, 0.24706, 0.39216, 0.715>]
            [1.00 colour rgbt <0.17647, 0.24706, 0.39216, 0.750>]
        }
        rotate <0,0,45>
       scale <0.78, 1.0, 0.4>
       rotate <5, 10, -55>
    }
    finish { ambient 0.225 diffuse 0.75 crand 0.01975}
}

//Brick red w/yellow-green swirls
#declare T_Stone42 =
texture  {
    pigment {
        onion
        turbulence  2.1
        omega 0.575
        colour_map  {
           [0.15 colour rgbt<0.29020, 0.08235, 0.00000, 0.0>]
           [0.35 colour rgbt<0.34118, 0.29020, 0.09020, 0.0>]
           [0.65 colour rgbt<0.29020, 0.08235, 0.00000, 0.0>]
           [0.85 colour rgbt<0.34118, 0.29020, 0.09020, 0.0>]
           [1.00 colour rgbt<0.29020, 0.08235, 0.00000, 0.0>]
        }
        scale <0.9, 1.6, .45>
        rotate <10, 5, 45>
    }
    finish { brilliance 1.825 }
}
texture  {
    pigment {
        granite
        turbulence 0.925
        colour_map  {
            [0.25 colour rgbt<0.42353, 0.37255, 0.05882, 0.45>]
            [0.50 colour rgbt<0.18431, 0.01569, 0.00000, 0.55>]
            [0.72 colour rgbt<0.42353, 0.37255, 0.05882, 0.55>]
            [1.00 colour rgbt<0.18431, 0.01569, 0.00000, 0.65>]
        }
        rotate <5, 15, 90>
        scale <0.78, 1.05, 0.4>
        rotate <5, 10, -55>
    }
    finish { ambient 0.225 diffuse 0.75 crand 0.01975 }
}

// Rusty red w/cream swirls and duck overtones
#declare T_Stone43 =
texture  {
    pigment {
        granite
        turbulence 0.815
        colour_map {
            [0.15 colour rgbt<0.86275, 0.75686, 0.61176, 0.0>]
            [0.45 colour rgbt<0.49804, 0.21569, 0.03922, 0.0>]
            [0.65 colour rgbt<0.84314, 0.72157, 0.63529, 0.0>]
            [0.85 colour rgbt<0.46667, 0.23922, 0.05098, 0.0>]
            [1.00 colour rgbt<0.87059, 0.73725, 0.62745, 0.0>]
        }
        scale <0.87, 1.235, 0.47>
        rotate <15, 25, 45>
    }
    finish {brilliance 2.585}
}
texture  {
    pigment {
        agate
        agate_turb 1.275
        colour_map {
            [0.35 colour rgbt<0.42353, 0.12157, 0.01176, 0.650>]
            [0.65 colour rgbt<0.50196, 0.35294, 0.21176, 0.750>]
            [1.00 colour rgbt<0.41569, 0.20784, 0.02745, 0.550>]
        }
        scale <0.69,1.27, 0.35>
        rotate <10, 5, -60>
    }
    finish { ambient 0.225 diffuse 0.6975 crand 0.02175 }
}

// This one is quite different from the rest.
// Its a dark, dull, bumpy rock texture.
#declare T_Stone44 =
texture {
    pigment {
        granite
        color_map {
            [0.0 rgb 0.3 ]
            [1.0 rgb 0.7 ]
        }
        scale 0.075
    }
    normal  { granite 0.75 scale 0.075 }
}
texture {
    pigment {
        wrinkles
        turbulence 0.3
        scale 0.3
        color_map {
            [0.0 rgbt< 0.50, 0.25, 0.10, 0.85>]
            [1.0 rgbt< 0.65, 0.40, 0.00, 0.65>]
        }
    }
}

#version Stones2_Inc_Temp;
#end
`,
    'strings.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: strings.inc
//    Last updated: 2001.8.9
//    Description: This file contains various macros for manipulating strings.

#ifndef(STRINGS_INC_TEMP)
#declare STRINGS_INC_TEMP = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
   #debug "including strings.inc\\n"
#end

//converts a color to a string, with filter and transmit
#macro CRGBFTStr(C, MinLen, Padding)
    concat( "color rgbft < ", str(C.red, MinLen, Padding), 
                        ", ", str(C.green, MinLen, Padding),
                        ", ", str(C.blue, MinLen, Padding),
                        ", ", str(C.filter, MinLen, Padding),
                        ", ", str(C.transmit, MinLen, Padding), ">")
#end

//converts a color to a string, without filter and transmit
#macro CRGBStr(C, MinLen, Padding)
    concat( "color rgb <   ", str(C.red, MinLen, Padding), 
                        ", ", str(C.green, MinLen, Padding),
                        ", ", str(C.blue, MinLen, Padding), ">")
#end

#macro Parse_String(String)
    #fopen FOut "parse_string.tmp" write
    #write(FOut,String)
    #fclose FOut
    #include "parse_string.tmp"
#end

//just a shortcut for using str() with system-defined precision and length.
#macro Str(A)
    str(A, 0,-1)
#end

//just a shortcut for using vstr()
//"Str" is with capitalized "S" to match the Str() macro
//above which also has system-defined precision and length.
#macro VStr2D(V)
    concat("<", vstr(2, V, ",", 0,-1), ">")
#end
#macro VStr(V)
    concat("<", vstr(3, V, ",", 0,-1), ">")
#end

//Another shortcut for using vstr(),
//this one with user specified precision and length.
//"str" is with non-capitalized "s" to match the str() function
//in POV-Ray which also has user-specified precision and length.
#macro Vstr2D(V,L,P)
    concat("<", vstr(2, V, ",", L,P), ">")
#end
#macro Vstr(V,L,P)
    concat("<", vstr(3, V, ",", L,P), ">")
#end

//Macros used to generate strings with mesh syntax.
//Can be used with the IO features to write a mesh to an external file.
#macro Triangle_Str(A, B, C)
    concat("triangle {<",   vstr(3, A, ",", 0,-1), ">,<",
                            vstr(3, B, ",", 0,-1), ">,<",
                            vstr(3, C, ",", 0,-1), ">}")
#end
#macro Smooth_Triangle_Str(A, NA, B, NB, C, NC)
    concat("smooth_triangle {<",    vstr(3, A, ",", 0,-1), ">,<",
                                    vstr(3, NA, ",", 0,-1), ">,<",
                                    vstr(3, B, ",", 0,-1), ">,<",
                                    vstr(3, NB, ",", 0,-1), ">,<",
                                    vstr(3, C, ",", 0,-1), ">,<",
                                    vstr(3, NC, ",", 0,-1), ">}")
#end


#version STRINGS_INC_TEMP;
#end//strings.inc

`,
    'sunpos.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

// Persistence of Vision Ray Tracer Scene Include File
// File: sunpos.inc
// Desc: This macro returns the suns position,          
//       on a given date, time, and location on earth.  
// Date: 15-09-1998
// Updated : 2001-07-27
// Auth: Ingo Janssen
//

#ifndef(SunPos_Inc_Temp)
#declare SunPos_Inc_Temp=version;
#version 3.5;

//
// ======================================================
//
// Assumption: in the scene north is in the +Z direction, south is -Z.
//
// Invoke in your scene:
//   light_source {
//      SunPos(Year, Month, Day, Hour, Minute, Lstm, LAT, LONG)
//      rgb 1
//   }
//
// Greenwich, noon on the longest day of 2000 (no daylight saving):
//   SunPos(2000, 6, 21, 12, 2, 0, 51.4667, 0.00) 
//
// Year:  in four digits
// Month: number
// Dat:   number
// Time:  in 24 hour format
// Lstm:  Meridian of your local timezone (+1 hour =  +15 deg)
//        in degrees (east = positive, west = negative)
// Location on earth: 
// LAT:   Lattitude in degrees.decimal, northern hemisphere = positive, southern = negative
// LONG:  Longitude in degrees.decimal, east = positive, west is negative
//
// The macro returns the position of the sun, but also declares it as the vector SolarPosition. 
// Also the found Azimuth (Az) and Altitude (Al) are declared, this can be usefull for 
// aligning an object with the sunlight: cylinder{
//                                          <-2,0,0>,<2,0,0>,0.1
//                                          rotate <0, Az-90, Al>
//                                          texture {.. LightRay ..}
//                                        }
//
// ======================================================
//
// Find your local position at http://gnpswww.nima.mil/geonames/GNS/ (Gazetteer search)
//
// Local time(zone) at http://www.hilink.com.au/times/
//
// Equations used here can be found at http://hotel04.ausys.se/pausch/english.htm (Computing rise/set times)
//  not only for the sun but also for the moon, planets and other stuff up there.
//
// ======================================================
//

#macro SunPos(Year, Month, Day, Hour, Minute, Lstm, LAT, LONG)

   #if (abs(LONG-Lstm)>30)
       #debug "\\nREMARK: \\nLongitude differs by more than 30 degrees from timezone meridian.\\n"
       #debug concat("Local timezone meridian is:",str(Lstm,5,0),"\\n")
       #debug concat("Longitude is:",str(LONG,5,0),"\\n")
   #end
   
       // Calculate universal time (UT)
   #local T= Hour+(Minute/60);
   #local UT= T-Lstm/15;
   #if (0>UT)
       #local Day= Day-1;
       #local UT= 24+UT;
   #end
   #if (UT>24)
       #local Day= Day+1;
       #local UT= UT-24;
   #end
   
       // Amount of days to, or from, the year 2000
   #local d= 367*Year-int((7*int((Year+int((Month+9))/12)))/4)+int((275*Month)/9)+Day-730530+UT/24;
   
       // Longitude of perihelion (w), eccentricity (e)
   #local w= 282.9404+4.70935E-5*d;
   #local e= 0.016709-1.151E-9*d;
   
       // Mean anomaly (M), sun's mean longitude (L)
   #local M= 356.0470+0.9856002585*d;
   #if (0<M<360)
       #local M= M-floor(M/360)*360;
   #end
   #local L= w+M;
   #if (0<L<360)
       #local L= L-floor(L/360)*360;
   #end
   
       // Obliquity of the ecliptic, eccentric anomaly (E)
   #local oblecl= 23.4393-3.563E-7*d;
   #local E= M+(180/pi)*e*sin(radians(M))*(1+e*cos(radians(M)));
   
       // Sun's rectangular coordinates in the plane of ecliptic (A,B)
   #local A= cos(radians(E))-e;
   #local B= sin(radians(E))*sqrt(1-e*e);
   
       // Distance (r), true anomaly (V), longitude of the sun (lon)
   #local r= sqrt(A*A+B*B);
   #local V= degrees(atan2(radians(B),radians(A)));
   #local lon= V+w;
   #if (0<lon<360)
       #local lon= lon-floor(lon/360)*360;
   #end
   
       // Calculate declination (Decl) and right ascension (RA)
   #local Decl= degrees(asin(sin(radians(oblecl))*sin(radians(lon))));
   #local RA= degrees(atan2(sin(radians(lon))*cos(radians(oblecl)),cos(radians(lon))))/15;
   
       // Greenwich meridian siderial time at 00:00 (GMST0),siderial time (SIDTIME), hour angle (HA)
   #local GMST0= L/15+12;
   #local SIDTIME= GMST0+UT+LONG/15;
   #local HA= (SIDTIME-RA)*15;
   
       // This is what we're looking for: Altitude & Azimuth
   #declare Al= degrees(asin(sin(radians(LAT))*sin(radians(Decl))+cos(radians(LAT))*cos(radians(Decl))*cos(radians(HA))));
   #declare Az= degrees(atan2(sin(radians(HA)),cos(radians(HA))*sin(radians(LAT))-tan(radians(Decl))*cos(radians(LAT))))+180;
   
   #declare SolarPosition=vrotate(<0,0,1000000000>,<-Al,Az,0>);
   (SolarPosition)

#end

#version SunPos_Inc_Temp;
#end
`,
    'textures.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: textures.inc
//    Last updated: 2001.7.25
//    Description:

#ifndef(Textures_Inc_Temp)
#declare Textures_Inc_Temp = version;
#version 3.5;

/*                     Standard textures include file

    Contents:
    ===========================
    DMFWood6
    NBglass            (Norm Bowler)
    NBoldglass         (Norm Bowler)
    NBwinebottle       (Norm Bowler)
    NBbeerbottle       (Norm Bowler)
    Ruby_Glass         (after Norm Bowler)
    Dark_Green_Glass   (after Norm Bowler)
    Yellow_Glass       (after Norm Bowler)
    Orange_Glass       (after Norm Bowler)
    Vicks_Bottle_Glass (after Norm Bowler)
    Soft_Silver        (Dan Farmer)
    New_Penny          (Dan Farmer)
    Tinny_Brass        (Dan Farmer)
    Gold_Nugget        (Dan Farmer)
    Aluminum           (Dan Farmer)
    Bright_Bronze      (Dan Farmer)
    Lightening1        (Dan Farmer)
    Lightening2        (Dan Farmer)
    Brushed_Aluminum   (Dan Farmer)
    Starfield          (Jeff Burton )
    Shadow_Clouds      (Bill Pulver)
*/

#include "finish.inc"

#ifdef(View_POV_Include_Stack)
    #debug "including textures.inc\\n"
#end


//*****************************************************************************
//                      STONE PIGMENTS
//*****************************************************************************

#declare Jade_Map =
color_map {
    [0.0 rgb <0.1, 0.6, 0.1>]
    [0.8 rgb <0.0, 0.3, 0.0>]
    [0.8 rgb <0.1, 0.6, 0.1>]
    [1.0 rgb <0.0, 0.2, 0.0>]
}

// Drew Wells' superb Jade.  Color map works nicely with other textures, too.
#declare Jade = 
pigment {
    marble
    turbulence 1.8
    color_map { Jade_Map }
}

#declare Red_Marble_Map = 
color_map {
    [0.0 rgb <0.8, 0.8, 0.6>]
    [0.8 rgb <0.8, 0.4, 0.4>]
    [1.0 rgb <0.8, 0.2, 0.2>]
}
// Classic white marble with red veins.  Over-worked, like checkers.
#declare Red_Marble = 
pigment {
    marble
    color_map { Red_Marble_Map }
    turbulence 1
}

#declare White_Marble_Map =
color_map {
    [0.0 rgb <0.9, 0.9, 0.9>]
    [0.8 rgb <0.5, 0.5, 0.5>]
    [1.0 rgb <0.2, 0.2, 0.2>]
}

// White marble with black veins.
#declare White_Marble = 
pigment {
    marble
    turbulence 1
    color_map { White_Marble_Map }
}

// Light blue and black marble with a thin red vein 
// Try changing LBlue and Vein below to modify the marble.
//#declare LBlue = rgb <0.0, 0.6, 0.6>;
//#declare Vein  = rgb <0.6, 0.0, 0.0>;
//These variables commented out to avoid possibility of name clashes

#declare Blood_Marble_Map =
color_map {
    [0.0 color 0]
    [0.8 color rgb <0.0, 0.6, 0.6>]
    [0.9 color rgb <0.6, 0.0, 0.0>]
//    [0.8 color LBlue]
//    [0.9 color Vein]
    [1.0 color 0]
}
#declare Blood_Marble = 
pigment {
    marble
    color_map { Blood_Marble_Map }
    turbulence 2.3
}

#declare Blue_Agate_Map =
color_map {
    [0.5  rgb <0.30, 0.30, 0.50>]
    [0.55 rgb <0.20, 0.20, 0.30>]
    [0.6  rgb <0.25, 0.25, 0.35>]
    [0.7  rgb <0.15, 0.15, 0.26>]
    [0.8  rgb <0.10, 0.10, 0.20>]
    [0.9  rgb <0.30, 0.30, 0.50>]
    [1.0  rgb <0.10, 0.10, 0.20>]
}

// a grey blue agate -- kind of purplish.
#declare Blue_Agate = 
pigment {
    agate
    color_map { Blue_Agate_Map }
}

#declare Sapphire_Agate_Map = 
color_map {
    [0.0  rgb <0.0, 0.0, 0.9>]
    [0.3  rgb <0.0, 0.0, 0.8>]
    [1.0  rgb <0.0, 0.0, 0.4>]
}


// Deep blue agate -- almost glows.
#declare Sapphire_Agate = 
pigment { 
    agate
    color_map { Sapphire_Agate_Map }
}

#declare Brown_Agate_Map =
color_map {
    [0.0 rgb 0]
    [0.5 rgb <0.9, 0.7, 0.6>]
    [0.6 rgb <0.9, 0.7, 0.4>]
    [1.0 rgb <0.7, 0.4, 0.2>]
}

// Brown and white agate -- very pretty.
#declare Brown_Agate = 
pigment {
    agate
    color_map { Brown_Agate_Map }
}

#declare Pink_Granite_Map =
color_map {
    [0.4  rgb 0]
    [0.4  rgb <0.85, 0.85, 0.95>]
    [0.45 rgb <0.85, 0.85, 0.95>]
    [0.5  rgb <0.75, 0.75, 0.75>]
    [0.55 rgb <0.82, 0.57, 0.46>]
    [0.8  rgb <0.82, 0.57, 0.46>]
    [1.0  rgb <1.00, 0.50, 0.00>]
}

#declare Pink_Granite =  
pigment {
    granite
    color_map { Pink_Granite_Map }
}

//*****************************************************************************
//                      STONE TEXTURES
//*****************************************************************************

// Gray-pink alabaster or marble.  Layers are scaled for a unit object
// and relative to each other.
// NOTE: This texture has very tiny dark blue specks that are often
//       mistaken for rendering errors.  They are not errors.  Just a
//       strange texture design.
#declare PinkAlabaster =
// Underlying surface is very subtly mottled with bozo
texture {
    pigment {
        bozo
        turbulence 0.25
        color_map {
            [0 rgb <0.9, 0.75, 0.75>]
            [1 rgb <0.6, 0.6,  0.6 >]
        }
    scale 0.4
    }
    finish{ ambient 0.25 }
}

// Second layer texture has some transmit values, yet a fair amount of color
// Viening is kept quite thin in color map and by the largish scale.
texture {
    pigment {
        granite
        color_map {
            [0.0 rgbt <0.52, 0.39, 0.39, 1.0>]
            [0.9 rgbt <0.52, 0.39, 0.39, 0.5>]
            [0.9 rgbt <0.42, 0.14, 0.55, 0.0>]
        }
    scale 2  
    }
    finish {
        specular 1   
        roughness 0.0001
        phong 0.25
        phong_size 75
        brilliance 4
    }
}


//*****************************************************************************
//                           SKY PIGMENTS
//*****************************************************************************
#declare Blue_Sky_Map =
color_map {
    [0.5 rgb <0.25, 0.25, 0.5>]
    [0.6 rgb 0.7]
    [1.0 rgb 0.3]
}

// Basic Blue Sky w/ clouds.
#declare Blue_Sky = 
pigment {
    bozo
    color_map { Blue_Sky_Map }
    turbulence 0.3
}

// Bright Blue Sky w/ very white clouds.
#declare Bright_Blue_Sky = 
pigment {
    bozo
    turbulence 0.56
    color_map {
        [0.5 rgb <0.5, 0.5, 1.0>]
        [0.6 rgb 1.0]
        [1.0 rgb 0.5]
    }
}

// Another sky
#declare Blue_Sky2 =
pigment {
    agate
    color_map {
        [0.3 rgb <0, 0, 1>]
        [1.0 rgb 1]
    }
    scale .75
}

// Small puffs of white clouds
#declare Blue_Sky3 = 
pigment {
    granite
    turbulence 0.1
    color_map {
        [0.3 rgb <0, 0, 1>]
        [1.0 rgb 1]
    }
    scale .75
}

// Red sky w/ yellow clouds -- very surreal.
#declare Blood_Sky = 
pigment {
    bozo
    turbulence 0.5
    color_map {
        [0.0 rgb <0.9, 0.700, 0.0>]
        [0.5 rgb <0.3, 0.200, 0.0>]
        [0.5 rgb <0.6, 0.025, 0.0>]
        [0.6 rgb <0.9, 0.700, 0.0>]
        [0.6 rgb <0.6, 0.025, 0.0>]
    }
}

// Black sky with red and purple clouds 
// Try adding turbulence values from 0.1 - 5.0 -- CdW
#declare Apocalypse = 
pigment {
    bozo
    color_map {
        [0.0 rgb <0.8, 0.0, 0.0>]
        [0.4 rgb <0.4, 0.0, 0.4>]
        [0.6 rgb <0.0, 0.0, 0.2>]
        [1.0 rgb 0.0]
    }
}

// White clouds w/ transparent sky.
#declare Clouds = 
pigment {
    bozo
    color_map {
        [0.1 rgbt <0.8, 0.8, 0.8, 0.0>]
        [0.5 rgbt <1.0, 1.0, 1.0, 1.0>] 
    }
}

#declare FBM_Clouds =
pigment {
    bozo
    turbulence 0.65
    octaves 6
    omega 0.7
    lambda 2
    color_map {
        [0.0 rgb 0.85]
        [0.1 rgb 0.75]
        [0.5 rgbt 1]
    }
    scale <6, 1, 6>
}

#declare Shadow_Clouds =
texture {                          // The blue sky background for the clouds 
    pigment { rgb <0.196078, 0.6, 0.8> }
    finish { ambient 0.7 diffuse 0 }
}
texture {                          // The upper part of the clouds
    pigment { FBM_Clouds }
    finish { ambient 1.0 diffuse 0 }
}
texture {                          // The darker underside of the clouds
    pigment { FBM_Clouds  translate -0.15*y }
    finish { ambient 0.6 diffuse 0 }
}



//*****************************************************************************
//                           WOODEN PIGMENTS
//*****************************************************************************

// Several wooden pigments by Tom Price:
// A light reddish wood.
#declare Cherry_Wood =
pigment {
    wood
    turbulence 0.3
    color_map {
        [0.8 rgb <0.66, 0.31, 0.20>]
        [0.8 rgb <0.40, 0.13, 0.06>]
        [1.0 rgb <0.20, 0.06, 0.03>]
    }
}

// A light tan wood with,ish rings.
#declare Pine_Wood = 
pigment {
    wood
    turbulence 0.2
    color_map {
        [0.8 rgb <1.0, 0.72, 0.25>]
        [0.8 rgb <0.5, 0.50, 0.06>]
        [1.0 rgb <0.4, 0.40, 0.03>]
    }
}

// Dark wood with a,ish hue to it.
#declare Dark_Wood = 
pigment {
    wood
    turbulence 0.2
    color_map {
        [0.8 rgb <0.43, 0.24, 0.05>]
        [0.8 rgb <0.40, 0.33, 0.06>]
        [1.0 rgb <0.20, 0.03, 0.03>]
    }
}

// Light tan wood with brown rings.
#declare Tan_Wood = 
pigment {
    wood
    turbulence 0.1
    color_map {
        [0.8 rgb <0.88, 0.60, 0.30>]
        [0.8 rgb <0.60, 0.40, 0.20>]
        [1.0 rgb <0.40, 0.30, 0.20>]
    }
}

// A very pale wood with tan rings -- kind of balsa-ish.
#declare White_Wood = 
pigment {
    wood
    turbulence 0.6
    color_map {
        [0.0 rgb <0.93, 0.71, 0.53>]
        [0.8 rgb <0.98, 0.81, 0.60>]
        [0.8 rgb <0.60, 0.33, 0.27>]
        [1.0 rgb <0.70, 0.60, 0.23>]
    }
}

// Brown wood - looks stained.
#declare Tom_Wood = 
pigment {
    wood
    turbulence 0.31
    color_map {
        [0.8 rgb < 0.7, 0.3, 0.0>]
        [0.8 rgb < 0.5, 0.2, 0.0>]
        [1.0 rgb < 0.4, 0.1, 0.0>]
    }
}

// The scaling in these definitions is relative to a unit-sized object
// (radius 1).  Note that woods are functionally equivilent to a log lying
// along the z axis.  For best results, think like a woodcutter trying to
// extract the nicest board out of that log.  A little tilt along the x axis
// will give elliptical rings of grain like you'd expect to find on most
// boards.  Experiment.
// (The first five came from DODEC2.POV in the POV Scenefile Library.)
#declare DMFWood1 = 
pigment {
    wood
    turbulence 0.04
    octaves 3
    scale <0.05, .05, 1>
    color_map {
        [0.1 rgb <0.60, 0.30, 0.18>]
        [0.9 rgb <0.30, 0.15, 0.09>]
    }
}

#declare DMFWood2 = 
pigment {
    wood
    turbulence 0.03
    octaves 4
    scale <0.05, .05, 1>
    color_map {
        [0.1 rgb <0.52, 0.37, 0.26>]
        [0.9 rgb <0.42, 0.26, 0.15>]
    }
}

#declare DMFWood3 = 
pigment {
    wood
    turbulence 0.05
    octaves 2
    scale <0.05, .05, 1>
    color_map {
        [0.1 rgb <0.4, 0.133, 0.066>]
        [0.9 rgb <0.2, 0.065, 0.033>]
    }
}

#declare DMFWood4 =
pigment {
    wood
    turbulence 0.04
    octaves 3
    scale <0.05, .05, 1>
    color_map {
        [0.1 rgb <0.888, 0.600, 0.3>]
        [0.9 rgb <0.600, 0.400, 0.2>]
    }
}

#declare DMFWood5 = 
pigment {
    wood
    turbulence 0.05
    octaves 6
    scale <0.075, .075, 1>
    color_map {
        [0.1 rgb <0.30, 0.10, 0.050>]
        [0.9 rgb <0.25, 0.07, 0.038>]
    }
}

// This is a three-layer wood texture.  Renders rather slowly because of
// the transparent layers and the two layers of turbulence, but it looks
// great.  Try other colors of "varnish" for simple variations.  
#declare DMFWood6 = 
texture {
    pigment {
        wood  turbulence 0.04
        octaves 3
        scale <0.05, .05, 1>
        color_map { 
            [0.1 rgb <0.88, 0.60, 0.4>]
            [0.9 rgb <0.60, 0.40, 0.3>]
        }
    }
    finish { 
        specular 0.25
        roughness 0.05
        ambient 0.45 
        diffuse 0.33
        reflection 0.15
    }
}
texture {
    pigment {
        wood  turbulence <0.1, 0.5, 1> 
        octaves 5
        lambda 3.25
        scale <0.15, .5, 1>
        color_map { 
            [0.0 rgbt <0.7, 0.6, 0.4, 0.100>]
            [0.1 rgbt <0.8, 0.6, 0.3, 0.500>]
            [0.1 rgbt <0.8, 0.6, 0.3, 0.650>]
            [0.9 rgbt <0.6, 0.4, 0.2, 0.975>]
            [1.0 rgbt <0.6, 0.4, 0.2, 1.000>]
        }
    rotate <5, 10, 5>
    translate -x*2
    }
    finish { 
        specular 0.25 
        roughness 0.0005
        ambient .1 
        diffuse 0.33
    } 
}
// A "coat of varnish" to modify the overall color of the wood
texture {
    pigment { rgbt <0.75, 0.15, 0.0, 0.95> }
    finish { 
        specular 0.25
        roughness 0.01
        ambient 0
        diffuse 0.33
    }
}




// Is this really oak?  I dunno.  Quite light, maybe more like spruce.
#declare DMFLightOak =  
pigment {
    wood
    turbulence 0.05            // For best results,  keep this low!
    scale <0.2, 0.2, 1>        // Scaled for a unit object
    color_map {
        [0.1 rgb <0.42, 0.26, 0.15>]
        [0.9 rgb <0.52, 0.37, 0.26>]
    }
}

// Looks like old desk oak if used correctly.
#declare DMFDarkOak = 
pigment {
    wood
    turbulence 0.04            // For best results,  keep this low!
    octaves 3
    scale <0.2, 0.2, 1>        // Scaled for a unit object
    color_map {
        [0.1 rgb <0.60, 0.30, 0.18>]
        [0.9 rgb <0.30, 0.15, 0.09>]
    }
}

// Wood by Eric Barish
#declare EMBWood1 = 
texture {  /* Bottom wood-grain layer */
    pigment {
        wood
        turbulence 0.05
        color_map {
            [0.00 rgb <0.58, 0.45, 0.23>]
            [0.34 rgb <0.65, 0.45, 0.25>]
            [0.40 rgb <0.33, 0.23, 0.13>]
            [0.47 rgb <0.60, 0.40, 0.20>]
            [1.00 rgb <0.25, 0.15, 0.05>]
        }
    }
    finish {
        crand 0.02
        ambient 0.32
        diffuse 0.63
        phong 0.2
        phong_size 10
    }
    normal { bumps 0.05 }
}
texture {     /* top layer, adds small dark spots */
    pigment {
        bozo
        color_map {
            [0.0 rgbt <1.00, 1.00, 1.00, 1.00>]
            [0.8 rgbt <1.00, 0.90, 0.80, 0.80>]
            [1.0 rgbt <0.30, 0.20, 0.10, 0.40>]
        }
    scale 0.25
    }
}


//   Doug Otwell woods
//   Yellow pine, close grained
//
#declare Yellow_Pine = 
texture {
    pigment {
        wood
        turbulence 0.02
        color_map {
            [0.222 rgb <0.808, 0.671, 0.251>]
            [0.342 rgb <0.600, 0.349, 0.043>]
            [0.393 rgb <0.808, 0.671, 0.251>]
            [0.709 rgb <0.808, 0.671, 0.251>]
            [0.821 rgb <0.533, 0.298, 0.027>]
            [1.000 rgb <0.808, 0.671, 0.251>]
        }
    scale 0.1
    translate <10, 0, 0>
    }
}
// Yellow_Pine layer 2
texture {
    pigment {
        wood
        turbulence 0.01
        color_map {
            [0.000 rgbt <1.000, 1.000, 1.000, 1.000>]
            [0.120 rgbt <0.702, 0.467, 0.118, 0.608>]
            [0.496 rgbt <1.000, 1.000, 1.000, 1.000>]
            [0.701 rgbt <1.000, 1.000, 1.000, 1.000>]
            [0.829 rgbt <0.702, 0.467, 0.118, 0.608>]
            [1.000 rgbt <1.000, 1.000, 1.000, 1.000>]
        }
    scale 0.5 
    translate <10, 0, 0>
    }
}

//
//   Rosewood
//
#declare Rosewood = 
texture {
    pigment {
        bozo
        turbulence 0.04
        color_map {
            [0.000 rgb <0.204, 0.110, 0.078>]
            [0.256 rgb <0.231, 0.125, 0.090>]
            [0.393 rgb <0.247, 0.133, 0.090>]
            [0.581 rgb <0.204, 0.110, 0.075>]
            [0.726 rgb <0.259, 0.122, 0.102>]
            [0.983 rgb <0.231, 0.125, 0.086>]
            [1.000 rgb <0.204, 0.110, 0.078>]
        }
    scale <0.5, 0.5, 1>
    translate <10, 0, 0>
    }
    finish {
        ambient 0.5
        diffuse 0.8
    }
}
// Rosewood layer 2
texture {
    pigment {
        wood
        turbulence 0.04
        color_map {
            [0.000 rgbt <0.545, 0.349, 0.247, 1.000>]
            [0.139 rgbt <0.000, 0.000, 0.000, 0.004>]
            [0.148 rgbt <0.000, 0.000, 0.000, 0.004>]
            [0.287 rgbt <0.545, 0.349, 0.247, 1.000>]
            [0.443 rgbt <0.545, 0.349, 0.247, 1.000>]
            [0.626 rgbt <0.000, 0.000, 0.000, 0.004>]
            [0.635 rgbt <0.000, 0.000, 0.000, 0.004>]
            [0.843 rgbt <0.545, 0.349, 0.247, 1.000>]
        }
    scale <0.5, 0.5, 1>
    translate <10, 0, 0>
    }
    finish {
        ambient 0.5
        diffuse 0.8
    }
}

//
//   Sandalwood ( makes a great burled maple, too)
//
#declare Sandalwood = 
texture {
    pigment {
        bozo
        turbulence 0.2
        color_map {
            [0.000 rgb <0.725, 0.659, 0.455>]
            [0.171 rgb <0.682, 0.549, 0.420>]
            [0.274 rgb <0.557, 0.451, 0.322>]
            [0.393 rgb <0.725, 0.659, 0.455>]
            [0.564 rgb <0.682, 0.549, 0.420>]
            [0.701 rgb <0.482, 0.392, 0.278>]
            [1.000 rgb <0.725, 0.659, 0.455>]
        }
    scale <0.2, 0.2, 1>
    scale 2
    }
}
// Sandalwood layer 2
texture {
    pigment {
        bozo
        turbulence 0.8
        color_map {
            [0.000 rgbt <0.682, 0.604, 0.380, 1.000>]
            [0.087 rgbt <0.761, 0.694, 0.600, 0.020>]
            [0.226 rgbt <0.635, 0.553, 0.325, 1.000>]
            [0.348 rgbt <0.761, 0.694, 0.600, 0.020>]
            [0.496 rgbt <0.682, 0.604, 0.380, 1.000>]
            [0.565 rgbt <0.761, 0.694, 0.600, 0.020>]
            [0.661 rgbt <0.682, 0.604, 0.380, 1.000>]
            [0.835 rgbt <0.761, 0.694, 0.600, 0.020>]
            [1.000 rgbt <0.682, 0.604, 0.380, 1.000>]
        }
    scale 0.4
    }
}


//*****************************************************************************
//                           GLASS TEXTURES
//*****************************************************************************

/* Note: New in POV-Ray 3.1, the "ior" keyword is supposed to be 
         specified in the new "interior{...}" statement.  
  
         Under POV-Ray 3.0x and prior, the "refraction" keyword served
         two puropses.  
           1) Turn on refraction: this is no longer necessary.  Any use
              of the "ior" keyword with a value other than 1.0 will
              turn on refraction.
           2) Attenuate transparency: Values of "refraction" that are
              between 0.0 and 1.0 would attenuate or darken the amount
              of light passing through.  The same effect can be obtained
              by adjusting the filter value.  A more realistic effect
              can be obtained using the new "fade_power" and "fade_distance"
              keywords in the "interior" statement.
         These textures and finishes should still work under POV-Ray 3.1
         but any new textures you create should make use of the new syntax.
 */
/*Modified for POV 3.5, added glass materials
More realistic results can be obtained if a perfectly clear pigment is used,
and either absorbing media or fade_color are used to color the glass.*/

#declare Glass_Finish=
finish {
    specular 1
    roughness 0.001
    ambient 0
    diffuse 0
    reflection 0.1
 #if (version<3.1)
    ior 1.5
 #end
}

#declare Glass_Interior = interior {ior 1.5}

#declare Glass = 
texture {
    pigment { rgbf<1.0, 1.0, 1.0, 0.7> }
    finish  { Glass_Finish }
}
#declare M_Glass = material {texture {Glass} interior {Glass_Interior}}

// Probably more of a "Plexiglas" than glass
#declare Glass2 = 
texture {
    pigment { rgbf <1,1,1,1> }
    finish {
        ambient 0
        diffuse 0
        reflection 0.5
        phong 0.3
        phong_size 60
    }
}
#declare M_Glass2 = material {texture {Glass2} interior {Glass_Interior}}

// An excellent lead crystal glass!
#declare Glass3 = 
texture {
    pigment { rgbf <0.98, 0.98, 0.98, 0.9> }
    finish  {
        ambient 0.1
        diffuse 0.1
        reflection 0.1
        specular 0.8
        roughness 0.0003
        phong 1 
        phong_size 400
     }
}
#declare M_Glass3 = material {texture {Glass3} interior {Glass_Interior}}

#declare Green_Glass = 
texture {
    Glass3
    pigment { rgbf <0.8, 1, 0.95, 0.9> }
}
#declare M_Green_Glass = material {texture {Green_Glass} interior {Glass_Interior}}

// Glass textures contributed by Norm Bowler, of Richland WA 
#declare NBglass =
texture {
    pigment { rgbf <0.98, 1.0, 0.99, 0.75> }
    finish {
        ambient 0.1
        diffuse 0.1
        reflection .25
        specular 1
        roughness .001
 #if (version<3.1)
    ior 1.5
 #end
    }
}
#declare M_NB_Glass = material {texture {NBglass} interior {Glass_Interior}}


#declare NBoldglass=
texture { 
    NBglass
    pigment { rgbf <0.8, 0.9, 0.85, 0.85> }
}
#declare M_NB_Old_Glass = material {texture {NBoldglass} interior {Glass_Interior}}

#declare NBwinebottle=
texture { 
    NBglass
    pigment { rgbf <0.4, 0.72, 0.4, 0.6> }
}
#declare M_NB_Winebottle_Glass = material {texture {NBwinebottle} interior {Glass_Interior}}

#declare NBbeerbottle=
texture { 
    NBglass
    pigment { rgbf <0.7, 0.5, 0.1, 0.6> }
}
#declare M_NB_Beerbottle_Glass = material {texture {NBbeerbottle} interior {Glass_Interior}}

// A few color variations on Norm's glass
// Ruby glass
#declare Ruby_Glass =
texture { 
    NBglass
    pigment { rgbf <0.9, 0.1, 0.2, 0.8> }
}
#declare M_Ruby_Glass = material {texture {Ruby_Glass} interior {Glass_Interior}}

// Dark, green glass
#declare Dark_Green_Glass=
texture { 
    NBglass
    pigment { rgbf <0.1, 0.7, 0.8, 0.8> }
}
#declare M_Dark_Green_Glass = material {texture {Dark_Green_Glass} interior {Glass_Interior}}

// Yellow glass
#declare Yellow_Glass=
texture { 
    NBglass
    pigment { rgbf <0.8, 0.8, 0.2, 0.8> }
}
#declare M_Yellow_Glass = material {texture {Yellow_Glass} interior {Glass_Interior}}

// Orange/Amber glass
#declare Orange_Glass=
texture { 
    NBglass
    pigment { rgbf <1.0, 0.5, 0.0, 0.8> }
}
#declare M_Orange_Glass = material {texture {Orange_Glass} interior {Glass_Interior}}

// Vicks bottle, glass
#declare Vicks_Bottle_Glass=
texture { 
    NBglass
    pigment { rgbf <0.1, 0.15, 0.5, 0.9> }
}
#declare M_Vicks_Bottle_Glass = material {texture {Vicks_Bottle_Glass} interior {Glass_Interior}}

//*****************************************************************************
//                           METAL FINISHES
//*****************************************************************************

#declare Metal =
finish {
    metallic
    ambient 0.2
    diffuse 0.7
    brilliance 6
    reflection 0.25
    phong 0.75
    phong_size 80
}

//*****************************************************************************
//                           METAL TEXTURES
//*****************************************************************************


// Good looking "metal" textures
#declare Chrome_Texture = 
texture {
    pigment { rgb <0.658824, 0.658824, 0.658824> }
    finish {
        ambient 0.3
        diffuse 0.7
        reflection 0.15
        brilliance 8
        specular 0.8
        roughness 0.1
    }
}

// A series of metallic textures using the Metal finish:
#declare Brass_Texture  = texture { pigment{ rgb <0.71, 0.65, 0.26>} finish{ Metal }}
#declare Gold_Texture   = texture { pigment{ rgb <0.85, 0.85, 0.10>} finish{ Metal }}
#declare Bronze_Texture = texture { pigment{ rgb <0.55, 0.47, 0.14>} finish{ Metal }}
#declare Copper_Texture = texture { pigment{ rgb <0.72, 0.45, 0.20>} finish{ Metal }}
#declare Silver_Texture = texture { pigment{ rgb <0.90, 0.91, 0.98>} finish{ Metal }}

// In the future, please refer to Chrome_Texture by this name.  I'd like
// to scrap the old name someday. Ditto with other "_Texture" names!
#declare Chrome_Metal = texture { Chrome_Texture }
#declare Brass_Metal  = texture { Brass_Texture  }
#declare Bronze_Metal = texture { Bronze_Texture }
#declare Gold_Metal   = texture { Gold_Texture   }
#declare Silver_Metal = texture { Silver_Texture }
#declare Copper_Metal = texture { Copper_Texture }

// A couple highly reflective metal textures.
#declare Polished_Chrome = 
texture {
    pigment { rgb <0.2, 0.2, 0.2> }
    finish {
        ambient 0.1
        diffuse 0.7
        brilliance 6.0
        reflection 0.6
        phong 0.8
        phong_size 120
    }
}

#declare Polished_Brass = 
texture {
    pigment { rgb <0.578, 0.422, 0.195> }
    finish {
        metallic
        ambient 0.1
        diffuse 0.8
        brilliance 6.0
        reflection 0.4
        phong 0.8
        phong_size 120
   }
}


// Beautiful military brass texture!
#declare New_Brass = 
texture {
    pigment { rgb <0.70, 0.56, 0.37> }
    finish {
        ambient 0.35
        diffuse 1.0
        brilliance 15
        phong 0.41
        phong_size 5
    }
}


// Spun Brass texture for cymbals & such
#declare Spun_Brass = 
texture { 
    New_Brass
    normal { waves 0.35 frequency 2 scale 0.01 }
}

// Brushed aluminum (brushed along X axis)
#declare Brushed_Aluminum = 
texture {
    Chrome_Metal
    normal {
        bumps -0.5
        scale <1, 0.001, 0.001>
    }
}


#declare SilverFinish =
finish {
    metallic
    ambient 0.25
    diffuse 0.65
    reflection 0.45
    brilliance 6
    phong 1
    phong_size 100
}


// Each of these looks good.  Slightly,r as you go down
#declare Silver1_Colour = color  rgb <0.94, 0.93, 0.83>;
#declare Silver2_Colour = color  rgb <0.94, 0.93, 0.86>;
#declare Silver3_Colour = color  rgb <0.94, 0.93, 0.90>;

#declare Silver1 = 
texture {
    pigment { Silver1_Colour }
    finish { SilverFinish }
}

#declare Silver2 = 
texture {
    pigment { Silver2_Colour }
    finish { SilverFinish }
}

#declare Silver3 = 
texture {
    pigment { Silver3_Colour }
    finish { SilverFinish }
}


// Interesting texture -- Give it a try.
// Sort of a "rgb <0.0, 0.0, 0.0> Hills Gold", black, white, and orange specks or splotches.
#declare Brass_Valley = 
texture {
    pigment {
        granite
        color_map {
            [0.3 rgb <0.82, 0.57, 0.46>]
            [0.3 rgb <0.00, 0.00, 0.00>]
            [0.6 rgb <0.85, 0.85, 0.95>]
            [0.6 rgb <0.82, 0.57, 0.46>]
            [1.0 rgb <0.85, 0.85, 0.95>]
        }
    }
    finish {
        metallic
        brilliance 6.0
        reflection 0.75
        phong 0.75
    }
}

#declare Rust =
texture { 
    pigment {
        granite
        color_map {
            [0.0 rgb <0.89, 0.51, 0.28>]
            [0.4 rgb <0.70, 0.13, 0.00>]
            [0.5 rgb <0.69, 0.41, 0.08>]
            [0.6 rgb <0.49, 0.31, 0.28>]
            [1.0 rgb <0.89, 0.51, 0.28>]
        }
    }
    finish { ambient 0.2 diffuse 0.4 }
}

#declare Rusty_Iron = 
texture {
    pigment {
        granite
        color_map {
            [0.0 rgb <0.42, 0.20, 0.20>]
            [0.5 rgb <0.50, 0.50, 0.02>]
            [0.6 rgb <0.60, 0.20, 0.20>]
            [0.6 rgb <0.30, 0.20, 0.20>]
        }
    }
    finish { ambient 0.2 diffuse 0.6 }
    normal { wrinkles 1 scale 0.1 }
}


#declare Soft_Silver = 
texture {
    pigment { Silver1_Colour }
    finish {
        metallic
        ambient 0.2
        diffuse 0.35
        specular 0.85
        roughness 0.01
        reflection 0.45
        brilliance 1.5
    }
}

#declare Metallic_Finish =
    finish {
        metallic
        ambient 0.1
        diffuse 0.65
        specular 0.85
        roughness 0.01
        reflection 0.45
        brilliance 1.5
    }

#declare New_Penny = 
texture {
    pigment { rgb <0.6, 0.45, 0.4> }
    finish { Metallic_Finish }
}

#declare Tinny_Brass = 
texture {
    pigment { rgb <0.70, 0.56, 0.37> }
    finish { Metallic_Finish }
}

#declare Gold_Nugget = 
texture {
    pigment { rgb <0.5, 0.35, 0.25> }
    finish { Metallic_Finish }
}

#declare Aluminum  = 
texture {
    pigment { rgb <0.55, 0.5, 0.45> }
    finish { Metallic_Finish }
}

#declare Bright_Bronze  = 
texture {
    pigment { rgb <0.36, 0.28, 0.20> }
    finish { Metallic_Finish }
}


//*****************************************************************************
//                    SPECIAL EFFECTS
//*****************************************************************************

// Red & white stripes - Looks best on a y axis Cylinder
// It "spirals" because it's gradient on two axis
#declare Candy_Cane = 
pigment {
    gradient x+y
    color_map {
        [0.25 rgb <1,0,0>]
        [0.25 rgb <1,1,1>]
        [0.75 rgb <1,1,1>]
        [0.75 rgb <1,0,0>]
    }
}

// Orange and Clear stripes spiral around the texture
// to make an object look like it was "Peeled"
// Now, you too can be M.C. Escher 
#declare Peel = 
pigment {
    gradient x+y
    color_map {
        [0.25 rgbf <1.0, 0.5, 0.0, 0.0>]
        [0.25 rgbf <1.0, 1.0, 1.0, 1.0>]
        [0.75 rgbf <1.0, 1.0, 1.0, 1.0>]
        [0.75 rgbf <1.0, 0.5, 0.0, 0.0>]
    }
}

#declare Y_Gradient = 
pigment {
    gradient y
    color_map {
        [0.00  rgb <1,0,0>]
        [0.33  rgb <0,0,1>]
        [0.66  rgb <0,1,0>]
        [1.00  rgb <1,0,0>]
    }
}

#declare X_Gradient = 
pigment {
    gradient x
    color_map {
        [0.00 rgb <1,0,0>]
        [0.33 rgb <0,0,1>]
        [0.66 rgb <1,1,1>]
    }
}

// Wavy water 
// Requires a sub-plane, and may require scaling to fit your scene.
//A far better water texture can be done using a perfectly clear pigment
//and fade_color or absorbing media in the interior.

#declare Water =
texture {
    pigment{ rgbf <0.0, 0.0, 1.0, 0.9> }
    normal {
        ripples 0.75
        frequency 10
    }
    finish {
        reflection {0.3, 1 fresnel}
        conserve_energy
    }
}
#declare Water_Int =
interior {
    ior 1.33
}

#declare M_Water =
material {
    texture {Water}
    interior {Water_Int}
}

#declare Cork =
texture {
    pigment {
        granite
        color_map {
            [0.00 rgb <0.93, 0.71, 0.532>]
            [0.60 rgb <0.98, 0.81, 0.60>]
            [0.60 rgb <0.50, 0.30, 0.20>]
            [0.65 rgb <0.50, 0.30, 0.20>]
            [0.65 rgb <0.80, 0.53, 0.46>]
            [1.00 rgb <0.85, 0.75, 0.35>]
        }
    }
    finish{ 
        specular 0.1 
        roughness 0.5 
    }
    scale 0.25     // Generally looks best scaled longer on one axis
}

//The correct spelling is "Lightning", not "Lightening"

#declare Lightning_CMap1 =  
color_map {
    [0.00 rgbf <1,1,1,0>]
    [0.15 rgbf <0.94, 0.81, 0.99, 0.65>]
    [0.25 rgbf <0.94, 0.81, 0.99, 0.65>]
    [0.30 rgbf <0.87, 0.58, 0.98, 0.85>]
    [0.40 rgbf <0.87, 0.58, 0.98, 0.85>]
    [0.45 rgbf <0.73, 0.16, 0.96, 0.95>]
}

#declare Lightning1 = 
texture {
    pigment {
        marble
        color_map { Lightning_CMap1 }
        turbulence 0.5
    }
    finish { ambient 1 }
}


#declare Lightning_CMap2 =  
color_map {
    [0.00 rgbf <1,1,1,0>]
    [0.10 rgbf <0.94, 0.81, 0.99, 0.65>]
    [0.20 rgbf <0.94, 0.81, 0.99, 0.65>]
    [0.30 rgbf <0.87, 0.58, 0.98, 0.85>]
    [0.45 rgbf <0.87, 0.58, 0.98, 0.85>]
    [0.65 rgbf <0.73, 0.16, 0.96, 0.95>]
}

#declare Lightning2 = 
texture {
    pigment {
        granite
        color_map { Lightning_CMap2 }
        turbulence 0.5
    }
    finish { ambient 1 }
}

// Starfield, by Jeff Burton
#declare Starfield = 
texture {
    pigment {
        granite  
        color_map {
            [0.72 rgb 0.00 ] // No Stars in this area
            [0.72 rgb 0.20 ] // Very Very Faint Stars
            [0.75 rgb 0.40 ] // Very Very Faint Stars
            [0.78 rgb 0.60 ] // Very Faint Stars
            [0.81 rgb 0.80 ] // Faint Stars
            [0.85 rgb 0.95 ] // Medium White Stars
            [0.91 rgb 1.00 ] // White Stars 
            [0.91 rgb 0.00 ] // No Stars in this area
        }
    scale .015
    }
    finish { ambient 1 }
}

// Irregular_Bricks_Ptrn() authors: Ron Parker and Rune S. Johansen
/* Irregular_Bricks_Ptrn( Mortar Thickness, X-scaling, Variation, Roundness )
This function pattern creates a pattern of bricks of varying lengths on the x-y plane.
This can be useful in building walls that don't look like they were built by a computer.
Note that mortar thickness between bricks can vary somewhat, too.

Mortar Thickness: How thick the mortar should be (0-1)
       X-scaling: The scaling of the bricks (but not the mortar) in the x direction
       Variation: The amount by which brick lengths will vary (0=none, 1=100%)
       Roundness: The roundness of the bricks (0.01=almost rectangular, 1.0=very round)

Sample code:
plane {-z, 0
   texture {
      pigment {
         Irregular_Bricks_Ptrn (0.1, 1, 0.5, 0.5)
         color_map {
            [0.01, rgb 0.9]
            [0.01, rgb 0.6]
         }
      }
      normal {
         Irregular_Bricks_Ptrn (0.1, 1, 0.5, 0.5) 2
      }
   }
}*/
#macro Irregular_Bricks_Ptrn (T, S, V, R)
   #local FunctionXGrad =
   function {
      pattern {
         gradient x triangle_wave
         warp {turbulence V*x octaves 1}
         warp {planar z 0}
         warp {repeat z offset< 0.5, 5, 0>}
         rotate -90*x
      }
   }
   #local FunctionYGrad =
   function {
      pattern {
         gradient y triangle_wave
         translate 0.5*y
      }
   }
   function {
      pow
      (1-min(1,
         (
            +pow(FunctionXGrad(x/S,y,z)*(1+T/S),1/R*2)
            +pow(FunctionYGrad(x/S,y,z)*(1+T  ),1/R*2)
         )
      ),R/2)
   }
#end


// Hex_Tiles_Ptrn() authors: Ron Parker and Juha Nieminen
#macro Hex_Tiles_Ptrn()
    #local G =
    pigment {gradient x
        color_map {[0 rgb 1][1 rgb 0]}
        scale sqrt(3)/2+.001
    }
    #local B =
    pigment {radial
        pigment_map {
            #local I = 0;
            #while(I<6)
                [I/6 G rotate(30+60*I)*y]
                [(I+1)/6 G rotate(30+60*I)*y]
                #local I = I + 1;
            #end
        }
    }
    pigment_pattern {
        #local T2 = sqrt(3)/2;
        radial
        pigment_map {
            [0   B translate < 0.5,0,-T2>]
            [1/3 B translate < 0.5,0,-T2>]
            [1/3 B translate <-1.0,0,  0>]
            [2/3 B translate <-1.0,0,  0>]
            [2/3 B translate < 0.5,0, T2>]
            [1   B translate < 0.5,0, T2>]
        }
        translate x
        warp {repeat 1.5*x flip x}
        warp {repeat.5*sqrt(3)*z flip z}
    }
#end

// Tiles_Ptrn() author: Rune S. Johansen
#macro Tiles_Ptrn()
   boxed scale 0.5 translate <0.5,0.5,0>
   warp {repeat x} warp {repeat y} warp {planar z, 0}
#end


// Star_Ptrn() author: Ron Parker
/* Star pattern 
This macro creates a pattern that resembles a star. It can be used together with
color_maps, pigment_maps, texture_maps etc. The pattern is in the X-Z plane,
centered around the origin.
           
 Star_Ptrn( Radius, Points, Skip )
           
     Radius: the radius of a circle drawn through the points
             of the star
     Points: the number of points on the star.
       Skip: the number of points to skip when drawing lines between
             points to form the star.  A normal 5-pointed star skips 
             2 points.  A Star of David also skips 2 points.  
             Skip must be less than <Points>/2 and greater than 0.  
             Integers are preferred but not required.  Skipping 1 
             point makes a regular polygon with <Points> sides.
      
 Example usage: (This creates a five-pointed star as on a US flag)
      pigment {
         Star_Ptrn(1,5,2)
         color_map {[0,rgb 1][1,blue 0.5]}
      }*/

#macro Star_Ptrn(SR, NP, SP)
    #local P =
    pigment {radial
        #local PA = 0.5-(SP/NP);
        pigment_map {
            [.5-PA/2 rgb 0]
            [.5-PA/2 rgb 1]
            [.5+PA/2 rgb 1]
            [.5+PA/2 rgb 0]
        }
        translate SR*x
    }
    pigment_pattern {radial
        pigment_map {
            #local I=0;
            #while(I<NP)
                [(I+.5)/NP P rotate I*360/NP*y]
                [(I+.5)/NP P rotate(I+1)*360/NP*y]
                #local I = I + 1;
            #end
        }
        rotate -90*x +90*z
    }
#end

#version Textures_Inc_Temp;
#end
`,
    'transforms.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: transforms.inc
//    Last updated: 2001.8.9
//    Description: Macros for dealing with transforms

#ifndef(TRANSFORMS_INC_TEMP)
#declare TRANSFORMS_INC_TEMP = version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
   #debug "including transforms.inc\\n"
#end

#include "math.inc"

// --------------------
// Transformation macros:
// --------------------
// Reorients and deforms object so original x axis points along A, original y along B,
// and original z along C.
#macro Shear_Trans(A, B, C)
   transform {
      matrix < A.x, A.y, A.z,
             B.x, B.y, B.z,
             C.x, C.y, C.z,
             0, 0, 0>
   }
#end

#macro Matrix_Trans(A, B, C, D)
   transform {
      matrix < A.x, A.y, A.z,
             B.x, B.y, B.z,
             C.x, C.y, C.z,
             D.x, D.y, D.z>
   }
#end


// "stretch" along a specific axis
#macro Axial_Scale_Trans(Axis, Amt)
   transform {
      transform {Point_At_Trans(Axis) inverse}
      scale <1,Amt,1>
      Point_At_Trans(Axis)
   }
#end


// rotate around a specific axis
// Author: Rune S. Johansen
#macro Axis_Rotate_Trans(Axis, Angle)
   #local vX = vaxis_rotate(x,Axis,Angle);
   #local vY = vaxis_rotate(y,Axis,Angle);
   #local vZ = vaxis_rotate(z,Axis,Angle);
   transform {
      matrix < vX.x,vX.y,vX.z, vY.x,vY.y,vY.z, vZ.x,vZ.y,vZ.z, 0,0,0 >
   }
#end


// Rotate around a specific point
#macro Rotate_Around_Trans(Rotation, Point)
   transform {
      translate -Point
      rotate Rotation
      translate Point
   }
#end


// based on original Reorient() macro by John VanSickle
#macro Reorient_Trans(Axis1, Axis2)
   #local vX1 = vnormalize(Axis1);
   #local vX2 = vnormalize(Axis2);
   #local Y = vcross(vX1, vX2);
   #if(vlength(Y) > 0)
      #local vY = vnormalize(Y);
      #local vZ1 = vnormalize(vcross(vX1, vY));
      #local vZ2 = vnormalize(vcross(vX2, vY));
      transform {
         matrix < vX1.x, vY.x,vZ1.x, vX1.y,vY.y,vZ1.y, vX1.z,vY.z, vZ1.z, 0,0,0 >
         matrix < vX2.x,vX2.y,vX2.z,  vY.x,vY.y, vY.z, vZ2.x,vZ2.y,vZ2.z, 0,0,0 >
      }
   #else
      #if (vlength(vX1-vX2)=0)
         transform {}
      #else
         #local vZ = VPerp_To_Vector(vX2);
         transform { Axis_Rotate_Trans(vZ,180) }
      #end
   #end
#end

// Similar to Reorient_Trans(), points y axis along Axis.
#macro Point_At_Trans(YAxis)
   #local Y = vnormalize(YAxis);
   #local X = VPerp_To_Vector(Y);
   #local Z = vcross(X, Y);
   Shear_Trans(X, Y, Z)
#end


// Calculates a transformation which will center the bounding box of Object
// along specified axis Axis
// Usage:
// object {MyObj
//     Center_Trans(MyObj, x) center along x axis
// You can also center along multiple axis:
//     Center_Trans(MyObj, x+y) center along x and y axis
#macro Center_Trans(Object, Axis)
   #local Mn = min_extent(Object);
   #local Mx = max_extent(Object);
   transform {translate -Axis*((Mx - Mn)/2 + Mn)}
#end

// Calculates a transformation which will align the bounding box
// of an object to a point. Negative values on Axis will align to
// the sides facing the negative ends of the coordinate system,
// positive values will align to the opposite sides, 0 means
// not to do any alignment on that axis.
// Usage:
// object {MyObj
//     Align_Trans(MyObj, x, Pt)
//     Align right side of object to be coplanar with Pt
//     Align_Trans(MyObj, -y, Pt)
//     Align bottom of object to be coplanar with Pt
#macro Align_Trans(Object, Axis, Pt)
   #local Mn = min_extent(Object);
   #local Mx = max_extent(Object);
   transform {
      #if(Axis.x < -0.5)
         translate x*(Pt - Mn.x)
      #else
         #if(Axis.x > 0.5)
            translate x*(Pt - Mx.x)
         #end
      #end
      
      #if(Axis.y < -0.5)
         translate y*(Pt - Mn.y)
      #else
         #if(Axis.y > 0.5)
            translate y*(Pt - Mx.y)
         #end
      #end
      
      #if(Axis.z < -0.5)
         translate z*(Pt - Mn.z)
      #else
         #if(Axis.z > 0.5)
            translate z*(Pt - Mx.z)
         #end
      #end
   }
#end

// Aligns an object to a spline for a given time value.
// The Z axis of the object will point in the forward direction
// of the spline and the Y axis of the object will point upwards.
// 
// usage:     object {MyObj Spline_Trans(MySpline, clock, y, 0.1, 0.5)}
// 
// Spline:    The spline that the object is aligned to.
// 
// Time:      The time value to feed to the spline, for example clock.
// 
// Sky:       The vector that is upwards in your scene, usually y.
// 
// Foresight: How much in advance the object will turn and bank.
//            Values close to 0 will give precise results, while higher
//            values give smoother results. It will not affect parsing
//            speed, so just find the value that looks best.
// 
// Banking:   How much the object tilts when turning. Note that the amount
//            of tilting is equally much controlled by the ForeSight value.
// 
// Author: Rune S. Johansen
#macro Spline_Trans (Spline, Time, Sky, Foresight, Banking)
   #local Location = <0,0,0>+Spline(Time);
   #local LocationNext = <0,0,0>+Spline(Time+Foresight);
   #local LocationPrev = <0,0,0>+Spline(Time-Foresight);
   #local Forward = vnormalize(LocationNext-Location);
   #local Right   = VPerp_To_Plane(Sky,Forward);
   #local Up      = VPerp_To_Plane(Forward,Right);
   #local Matrix = Matrix_Trans(Right,Up,Forward,Location)
   #local BankingRotation =
   degrees(atan2(
      VRotation(
         VProject_Plane((LocationNext-Location),Sky),
         VProject_Plane((Location-LocationPrev),Sky),
         Up
      )*Banking
      ,1
   ));
   transform {
      rotate BankingRotation*z
      transform Matrix
   }
#end


#macro vtransform(vec, trans)
   #local fn = function { transform { trans } }
   #local result = (fn(vec.x, vec.y, vec.z));
   result
#end

#macro vinv_transform(vec, trans)
   #local fn = function { transform { trans inverse } }
   #local result = (fn(vec.x, vec.y, vec.z));
   result
#end


#version TRANSFORMS_INC_TEMP;
#end
`,
    'woodmaps.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: woodmaps.inc
//    Last updated: 2001.7.24
//    Description:
/*                         Basic wooden colormaps

 The "M_WoodxA" color_maps are intended as the 1st layer of multi-layer
 textures, but many work well by themselves, as well.

 The "M_WoodxB" color_maps contain transparent colors and are intended for
 use as top layers.
*/

#ifndef(Woodmaps_Inc_Temp)
#declare Woodmaps_Inc_Temp=version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
    #debug "including woodmaps.inc\\n"
#end


#declare M_Wood1A =
color_map { 
    [0.0, 0.1 color rgb <0.88, 0.60, 0.40>
              color rgb <0.88, 0.60, 0.40>]
    [0.1, 0.9 color rgb <0.88, 0.60, 0.40>
              color rgb <0.60, 0.30, 0.20>]
    [0.9, 1.0 color rgb <0.60, 0.30, 0.20>
              color rgb <0.60, 0.30, 0.20>]
}
#declare M_Wood1B = 
color_map { 
    [0.0, 0.1 color rgbt <0.55, 0.32, 0.20, 0.100> 
              color rgbt <0.55, 0.32, 0.20, 0.500>]
    [0.1, 0.2 color rgbt <0.55, 0.35, 0.20, 0.650>
              color rgbt <0.88, 0.60, 0.40, 0.975>]
    [0.2, 0.3 color rgbt <0.88, 0.60, 0.40, 0.975>
              color rgbt <0.60, 0.30, 0.20, 1.000>]
    [0.3, 0.4 color rgbt <0.60, 0.30, 0.20, 0.100> 
              color rgbt <0.60, 0.30, 0.20, 0.500>]
    [0.4, 0.9 color rgbt <0.60, 0.30, 0.20, 0.650>
              color rgbt <0.88, 0.60, 0.40, 0.975>]
    [0.9, 1.0 color rgbt <0.88, 0.60, 0.40, 0.975>
              color rgbt <0.55, 0.32, 0.20, 1.000>]
}


#declare M_Wood2A = 
color_map { 
    [0.0, 0.1 color rgb <0.35, 0.16, 0.12 >* 0.5
              color rgb <0.35, 0.16, 0.12>* 0.5]
    [0.1, 0.9 color rgb <0.35, 0.20, 0.16>* 0.5
              color rgb <0.46, 0.26, 0.18>* 0.5]
    [0.9, 1.0 color rgb <0.46, 0.26, 0.18>* 0.5
              color rgb <0.35, 0.16, 0.12>* 0.5]
}
#declare M_Wood2B = 
color_map { 
    [0.0, 0.1 color rgbt <0.50, 0.30, 0.20, 0.100> 
              color rgbt <0.50, 0.30, 0.20, 0.500>]
    [0.1, 0.9 color rgbt <0.50, 0.30, 0.20, 0.650>
              color rgbt <0.50, 0.25, 0.15, 0.975>]
    [0.9, 1.0 color rgbt <0.50, 0.25, 0.15, 0.975>
              color rgbt <0.50, 0.30, 0.20, 0.000>]
}
#declare M_Wood3A =
color_map {
    [0.0, 0.1 color rgb <0.75, 0.65, 0.45>
              color rgb <0.75, 0.65, 0.45>]
    [0.1, 0.9 color rgb <0.75, 0.65, 0.45>
              color rgb <0.70, 0.55, 0.40>]
    [0.9, 1.0 color rgb <0.70, 0.55, 0.40>
              color rgb <0.75, 0.65, 0.45>]
}
#declare M_Wood3B =
color_map {
    [0.0, 0.1 color rgbt <0.70, 0.60, 0.40, 0.100>
              color rgbt <0.70, 0.60, 0.40, 0.500>]
    [0.1, 0.9 color rgbt <0.70, 0.60, 0.40, 0.650>
              color rgbt <0.75, 0.70, 0.60, 0.975>]
    [0.9, 1.0 color rgbt <0.75, 0.70, 0.60, 0.975>
              color rgbt <0.70, 0.60, 0.40, 1.000>]
}
#declare M_Wood4A = 
color_map { 
    [0.0, 0.3 color rgb <0.30, 0.10, 0.15>
              color rgb <0.30, 0.15, 0.15>]
    [0.3, 0.6 color rgb <0.30, 0.15, 0.15>
              color rgb <0.50, 0.20, 0.15>]
    [0.6, 1.0 color rgb <0.50, 0.20, 0.15>
              color rgb <0.30, 0.10, 0.15>]
}
#declare M_Wood4B = 
color_map { 
/*
    [0.0, 0.3 color rgbt <0.40, 0.18, 0.20, 0.00> 
              color rgbt <0.20, 0.10, 0.15, 0.20>]
    [0.3, 0.4 color rgbt <0.20, 0.10, 0.15, 0.35>
              color rgbt <0.10, 0.05, 0.07, 0.50>]
    [0.4, 0.6 color rgbt <0.10, 0.05, 0.07, 0.20>
              color rgbt <0.20, 0.10, 0.15, 0.35>]
    [0.6, 1.0 color rgbt <0.20, 0.10, 0.15, 0.50>
              color rgbt <0.40, 0.18, 0.20, 0.00>]
*/
    [0.0, 0.3 color rgbt <0.32, 0.15, 0.17, 0.00> 
              color rgbt <0.32, 0.13, 0.15, 0.20>]
    [0.3, 0.4 color rgbt <0.32, 0.13, 0.13, 0.35>
              color rgbt <0.52, 0.25, 0.23, 0.40>]
    [0.4, 0.6 color rgbt <0.52, 0.25, 0.23, 0.20>
              color rgbt <0.32, 0.13, 0.13, 0.35>]
    [0.6, 1.0 color rgbt <0.32, 0.13, 0.15, 0.50>
              color rgbt <0.32, 0.15, 0.20, 0.00>]

}
#declare M_Wood5A = 
color_map { 
    [0.0, 0.3 color rgb <0.50, 0.35, 0.10>
              color rgb <0.50, 0.35, 0.10>]
    [0.3, 0.6 color rgb <0.50, 0.35, 0.10>
              color rgb <0.60, 0.45, 0.10>]
    [0.6, 1.0 color rgb <0.60, 0.45, 0.10>
              color rgb <0.50, 0.35, 0.10>]
}
#declare M_Wood5B = 
color_map { 
    [0.0, 0.1 color rgbt <0.40, 0.35, 0.10, 1.00> 
              color rgbt <0.40, 0.00, 0.10, 0.60>]
    [0.1, 0.9 color rgbt <0.40, 0.00, 0.10, 0.75>
              color rgbt <0.35, 0.40, 0.15, 0.90>]
    [0.9, 1.0 color rgbt <0.35, 0.40, 0.15, 0.90>
              color rgbt <0.40, 0.35, 0.10, 1.00>]
}
#declare M_Wood6A = 
color_map { 
    [0.0, 0.3 color rgb <0.25, 0.10, 0.10>
              color rgb <0.25, 0.10, 0.10>]
    [0.3, 0.6 color rgb <0.25, 0.10, 0.10>
              color rgb <0.60, 0.15, 0.10>]
    [0.6, 1.0 color rgb <0.60, 0.15, 0.10>
              color rgb <0.25, 0.10, 0.10>]
}
#declare M_Wood6B = 
color_map { 
    [0.0, 0.3 color rgbt <0.25, 0.10, 0.10, 0.00> 
              color rgbt <0.25, 0.10, 0.10, 0.40>]
    [0.3, 0.5 color rgbt <0.25, 0.10, 0.10, 0.40>
              color rgbt <0.60, 0.15, 0.10, 1.00>]
    [0.5, 0.7 color rgbt <0.60, 0.15, 0.10, 1.00>
              color rgbt <0.25, 0.10, 0.10, 0.40>]
    [0.7, 1.0 color rgbt <0.60, 0.15, 0.10, 0.40>
              color rgbt <0.25, 0.10, 0.10, 0.00>]
}
#declare M_Wood7A = 
color_map { 
    [0.0, 0.1 color rgb <0.60, 0.35, 0.20>
              color rgb <0.60, 0.35, 0.20>]
    [0.1, 0.9 color rgb <0.60, 0.35, 0.20>
              color rgb <0.90, 0.65, 0.30>]
    [0.9, 1.0 color rgb <0.90, 0.65, 0.30>
              color rgb <0.60, 0.35, 0.20>]
}
#declare M_Wood7B = 
color_map { 
    [0.0, 0.1 color rgbt <0.90, 0.65, 0.30, 0.00>
              color rgbt <0.90, 0.65, 0.30, 0.30>]
    [0.1, 1.0 color rgbt <0.90, 0.65, 0.30, 0.30>
              color rgbt <1.00, 1.00, 1.00, 1.00> ] 
}
#declare M_Wood8A = 
color_map { 
    [0.0, 0.1 color rgb <0.45, 0.30, 0.15>
              color rgb <0.45, 0.30, 0.15>]
    [0.1, 0.9 color rgb <0.55, 0.30, 0.15>
              color rgb <0.20, 0.15, 0.05>]
    [0.9, 1.0 color rgb <0.20, 0.15, 0.05>
              color rgb <0.45, 0.30, 0.15>]
}
#declare M_Wood8B = 
color_map { 
    [0.0, 0.5 color rgbt <0.60, 0.35, 0.20, 0.30>
              color rgbt <0.60, 0.35, 0.20, 0.80>]
    [0.5, 1.0 color rgbt <0.60, 0.35, 0.20, 0.80>
              color rgbt <1.00, 1.00, 1.00, 1.00> ] 
}
#declare M_Wood9A = 
color_map { 
    [0.0, 0.5 color rgb <1.00, 0.85, 0.50>
              color rgb <0.60, 0.40, 0.16>]
    [0.5, 0.7 color rgb <0.60, 0.40, 0.16>
              color rgb <0.60, 0.40, 0.16>]
    [0.7, 1.0 color rgb <0.60, 0.40, 0.16>
              color rgb <1.00, 0.85, 0.50>]
}
#declare M_Wood9B = 
color_map { 
    [0.0, 0.5 color rgbt <1.00, 0.70, 0.25, 1.00>
              color rgbt <0.50, 0.30, 0.06, 0.40>]
    [0.5, 0.7 color rgbt <0.50, 0.30, 0.06, 0.40>
              color rgbt <0.50, 0.30, 0.06, 0.30>]
    [0.7, 1.0 color rgbt <0.50, 0.30, 0.06, 0.40>
              color rgbt <1.00, 0.70, 0.25, 1.00>]
}
#declare M_Wood10A = 
color_map { 
    [0.0, 0.5 color rgb <1.00, 0.85, 0.50>
              color rgb <0.90, 0.70, 0.46>]
    [0.5, 0.7 color rgb <0.90, 0.70, 0.46>
              color rgb <0.90, 0.70, 0.46>]
    [0.7, 1.0 color rgb <0.90, 0.70, 0.46>
              color rgb <1.00, 0.85, 0.50>]
}
#declare M_Wood10B = 
color_map { 
    [0.0, 0.5 color rgbt <1.00, 0.45, 0.10, 0.80>
              color rgbt <0.85, 0.65, 0.40, 0.40>]
    [0.5, 0.7 color rgbt <0.85, 0.65, 0.40, 0.40>
              color rgbt <0.85, 0.65, 0.40, 0.40>]
    [0.7, 1.0 color rgbt <0.85, 0.65, 0.40, 0.40>
              color rgbt <1.00, 0.45, 0.10, 0.80>]
}
#declare M_Wood11A = 
color_map {
    [0.000, 0.222 color rgb <0.80, 0.67, 0.25>
                  color rgb <0.80, 0.67, 0.25>]
    [0.222, 0.342 color rgb <0.80, 0.67, 0.25>
                  color rgb <0.60, 0.34, 0.04>]
    [0.342, 0.393 color rgb <0.60, 0.34, 0.04>
                  color rgb <0.80, 0.67, 0.25>]
    [0.393, 0.709 color rgb <0.80, 0.67, 0.25>
                  color rgb <0.80, 0.67, 0.25>]
    [0.709, 0.821 color rgb <0.80, 0.67, 0.25>
                  color rgb <0.53, 0.29, 0.02>]
    [0.821, 1.000 color rgb <0.53, 0.29, 0.02>
                  color rgb <0.80, 0.67, 0.25>]
}
#declare M_Wood11B = 
color_map {
    [0.000, 0.120 color rgbt <1.00, 1.00, 1.00, 1.00>
                  color rgbt <0.70, 0.41, 0.11, 0.60>]
    [0.120, 0.231 color rgbt <0.70, 0.41, 0.11, 0.60>
                  color rgbt <0.70, 0.46, 0.11, 0.60>]
    [0.231, 0.496 color rgbt <0.70, 0.46, 0.11, 0.60>
                  color rgbt <1.00, 1.00, 1.00, 1.00>]
    [0.496, 0.701 color rgbt <1.00, 1.00, 1.00, 1.00>
                  color rgbt <1.00, 1.00, 1.00, 1.00>]
    [0.701, 0.829 color rgbt <1.00, 1.00, 1.00, 1.00>
                  color rgbt <0.70, 0.46, 0.11, 0.60>]
    [0.829, 1.000 color rgbt <0.70, 0.46, 0.11, 0.60>
                  color rgbt <1.00, 1.00, 1.00, 1.00>]
}
#declare M_Wood12A = 
color_map {
    [0.000, 0.256 color rgb <0.20, 0.11, 0.07>*1.25 
                  color rgb <0.23, 0.12, 0.09>*1.25]
    [0.256, 0.393 color rgb <0.23, 0.12, 0.09>*1.25
                  color rgb <0.24, 0.13, 0.09>*1.25]
    [0.393, 0.581 color rgb <0.24, 0.13, 0.09>*1.25
                  color rgb <0.20, 0.11, 0.07>*1.25]
    [0.581, 0.726 color rgb <0.20, 0.11, 0.07>*1.25
                  color rgb <0.25, 0.12, 0.10>*1.25]
    [0.726, 0.983 color rgb <0.25, 0.12, 0.10>*1.25
                  color rgb <0.23, 0.12, 0.08>*1.25]
    [0.983, 1.000 color rgb <0.23, 0.12, 0.08>*1.25
                  color rgb <0.20, 0.11, 0.07>*1.25]
}
#declare M_Wood12B = 
color_map {
    [0.000, 0.139 color rgbt <0.545, 0.349, 0.247, 1.000>
                  color rgbt <0.450, 0.350, 0.320, 0.800>]
    [0.139, 0.148 color rgbt <0.450, 0.350, 0.320, 0.800>
                  color rgbt <0.450, 0.350, 0.320, 0.800>]
    [0.148, 0.287 color rgbt <0.450, 0.350, 0.320, 0.800>
                  color rgbt <0.545, 0.349, 0.247, 1.000>]
    [0.287, 0.443 color rgbt <0.545, 0.349, 0.247, 1.000>
                  color rgbt <0.545, 0.349, 0.247, 1.000>]
    [0.443, 0.626 color rgbt <0.545, 0.349, 0.247, 1.000>
                  color rgbt <0.450, 0.350, 0.320, 0.800>]
    [0.626, 0.635 color rgbt <0.450, 0.350, 0.320, 0.800>
                  color rgbt <0.450, 0.350, 0.320, 0.800>]
    [0.635, 0.843 color rgbt <0.450, 0.350, 0.320, 0.800>
                  color rgbt <0.545, 0.349, 0.247, 1.000>]
    [0.843, 1.000 color rgbt <0.545, 0.349, 0.247, 1.000>
                  color rgbt <0.545, 0.349, 0.247, 1.000>]
}
// Same as M_Wood7A
#declare M_Wood13A = 
color_map { 
    [0.0, 0.1 color rgb <0.60, 0.35, 0.20>
              color rgb <0.60, 0.35, 0.20>]
    [0.1, 0.9 color rgb <0.60, 0.35, 0.20>
              color rgb <0.90, 0.65, 0.30>]
    [0.9, 1.0 color rgb <0.90, 0.65, 0.30>
              color rgb <0.60, 0.35, 0.20>]
}
// Same as M_Wood7B
#declare M_Wood13B = 
/********
color_map { 
    [0.0, 0.1 color rgbt <0.90, 0.65, 0.30, 0.00>
              color rgbt <0.90, 0.65, 0.30, 0.30>]
    [0.1, 1.0 color rgbt <0.90, 0.65, 0.30, 0.30>
              color rgbt <1.00, 1.00, 1.00, 1.00> ] 
}
********/
color_map { 
    [0.0, 0.4 color rgbt <1.00, 1.00, 1.00, 1.00>
              color rgbt <0.90, 0.65, 0.30, 0.30>]
    [0.4, 0.5 color rgbt <0.90, 0.65, 0.30, 0.00>
              color rgbt <0.90, 0.65, 0.30, 0.30>]
    [0.5, 1.0 color rgbt <0.90, 0.65, 0.30, 0.30>
              color rgbt <1.00, 1.00, 1.00, 1.00> ] 
}
#declare M_Wood14A = 
colour_map {
    [0.00 0.10 color rgb < 0.80, 0.232, 0.115 >
               color rgb < 0.80, 0.232, 0.115 >]
    [0.10 0.90 color rgb < 0.80, 0.232, 0.115 >
               color rgb < 0.45, 0.115, 0.060 >]
    [0.90 1.0  color rgb < 0.45, 0.115, 0.060 >
               color rgb < 0.45, 0.115, 0.060 >]
}

#declare M_Wood14B = 
colour_map {
    [0.00 0.10 color rgbt < 0.70, 0.232, 0.115, 0.5 >
               color rgbt < 0.70, 0.232, 0.115, 0.7 >]
    [0.10 0.15 color rgbt < 0.70, 0.232, 0.115, 0.7 >
               color rgbt < 0.35, 0.115, 0.060, 0.9 >]
    [0.15 0.20 color rgbt < 0.70, 0.232, 0.115, 0.9 >
               color rgbt < 0.35, 0.115, 0.060, 0.7 >]
    [0.20 1.0  color rgbt < 0.35, 0.115, 0.060, 0.7 >
               color rgbt < 0.35, 0.115, 0.060, 0.5 >]
}
#declare M_Wood15A = 
colour_map {
    [0.00 0.25   color rgb < 0.504, 0.310, 0.078> * 0.7
                 color rgb < 0.531, 0.325, 0.090> * 0.8 ]
    [0.25 0.40   color rgb < 0.531, 0.325, 0.090> * 0.8
                 color rgb < 0.547, 0.333, 0.090> * 0.5 ]
    [0.40 0.50   color rgb < 0.547, 0.333, 0.090> * 0.5
                 color rgb < 0.504, 0.310, 0.075> * 0.6 ]
    [0.50 0.70   color rgb < 0.504, 0.310, 0.075> * 0.6 
                 color rgb < 0.559, 0.322, 0.102> * 0.4 ]
    [0.70 0.98   color rgb < 0.559, 0.322, 0.102> * 0.4
                 color rgb < 0.531, 0.325, 0.086> * 0.4 ]
    [0.98 1.00   color rgb < 0.531, 0.325, 0.086> * 0.4
                 color rgb < 0.504, 0.310, 0.078> * 0.7 ]
}
#declare M_Wood15B = 
colour_map {
    [0.00 0.25   color rgbt < 0.404, 0.210, 0.078, 0.20>
                 color rgbt < 0.431, 0.225, 0.090, 0.80>]
    [0.25 0.40   color rgbt < 0.431, 0.225, 0.090, 0.80>
                 color rgbt < 0.447, 0.233, 0.090, 0.20>]
    [0.40 0.50   color rgbt < 0.447, 0.233, 0.090, 0.20>
                 color rgbt < 0.404, 0.210, 0.075, 0.60>]
    [0.50 0.70   color rgbt < 0.404, 0.210, 0.075, 0.60>
                 color rgbt < 0.459, 0.222, 0.102, 0.20>]
    [0.70 0.98   color rgbt < 0.459, 0.222, 0.102, 0.20>
                 color rgbt < 0.431, 0.225, 0.086, 0.40>]
    [0.98 1.00   color rgbt < 0.431, 0.225, 0.086, 0.40>
                 color rgbt < 0.404, 0.210, 0.078, 0.10>]
}
#declare M_Wood16A =
colour_map {
    [0.00 0.25   color rgb < 0.504, 0.310, 0.078> * 0.7
                 color rgb < 0.531, 0.325, 0.090> * 0.8 ]
    [0.25 0.40   color rgb < 0.531, 0.325, 0.090> * 0.8
                 color rgb < 0.547, 0.333, 0.090> * 0.5 ]
    [0.40 0.50   color rgb < 0.547, 0.333, 0.090> * 0.5
                 color rgb < 0.504, 0.310, 0.075> * 0.6 ]
    [0.50 0.70   color rgb < 0.504, 0.310, 0.075> * 0.6
                 color rgb < 0.559, 0.322, 0.102> * 0.4 ]
    [0.70 0.98   color rgb < 0.559, 0.322, 0.102> * 0.4
                 color rgb < 0.531, 0.325, 0.086> * 0.4 ]
    [0.98 1.00   color rgb < 0.531, 0.325, 0.086> * 0.4
                 color rgb < 0.504, 0.310, 0.078> * 0.7 ]
}
#declare M_Wood16B =
colour_map {
    [0.00 0.25   color rgbt < 0.404, 0.210, 0.078, 0.30>
                 color rgbt < 0.431, 0.225, 0.090, 0.60>]
    [0.25 0.40   color rgbt < 0.431, 0.225, 0.090, 0.60>
                 color rgbt < 0.447, 0.233, 0.090, 0.30>]
    [0.40 0.50   color rgbt < 0.447, 0.233, 0.090, 0.30>
                 color rgbt < 0.404, 0.210, 0.075, 0.40>]
    [0.50 0.70   color rgbt < 0.404, 0.210, 0.075, 0.40>
                 color rgbt < 0.459, 0.222, 0.102, 0.20>]
    [0.70 0.98   color rgbt < 0.459, 0.222, 0.102, 0.20>
                 color rgbt < 0.431, 0.225, 0.086, 0.50>]
    [0.98 1.00   color rgbt < 0.431, 0.225, 0.086, 0.50>
                 color rgbt < 0.404, 0.210, 0.078, 0.30>]
}
#declare M_Wood17A =
colour_map {
    [0.00 0.25   color rgb < 0.70, 0.40, 0.15> * 0.9
                 color rgb < 0.75, 0.42, 0.30> * 0.7 ]
    [0.25 0.40   color rgb < 0.75, 0.42, 0.25> * 0.7
                 color rgb < 0.74, 0.43, 0.30> * 0.5 ]
    [0.40 0.50   color rgb < 0.74, 0.43, 0.20> * 0.5
                 color rgb < 0.70, 0.42, 0.15> * 0.3 ]
    [0.50 0.70   color rgb < 0.70, 0.42, 0.15> * 0.3 
                 color rgb < 0.64, 0.46, 0.10> * 0.4 ]
    [0.70 0.98   color rgb < 0.64, 0.46, 0.10> * 0.4
                 color rgb < 0.65, 0.42, 0.20> * 0.6 ]
    [0.98 1.00   color rgb < 0.65, 0.42, 0.20> * 0.6
                 color rgb < 0.60, 0.40, 0.15> * 0.9 ]
}
#declare M_Wood17B = 
colour_map {
    [0.00 0.25   color rgbt < 0.40, 0.20, 0.08, 0.10>
                 color rgbt < 0.44, 0.23, 0.09, 0.20>]
    [0.25 0.40   color rgbt < 0.44, 0.23, 0.09, 0.20>
                 color rgbt < 0.45, 0.25, 0.09, 0.30>]
    [0.40 0.50   color rgbt < 0.45, 0.25, 0.09, 0.30>
                 color rgbt < 0.40, 0.20, 0.08, 0.60>]
    [0.50 0.70   color rgbt < 0.40, 0.20, 0.08, 0.60>  
                 color rgbt < 0.46, 0.23, 0.10, 0.30>]
    [0.70 0.98   color rgbt < 0.46, 0.23, 0.10, 0.30> 
                 color rgbt < 0.44, 0.23, 0.09, 0.20>]
    [0.98 1.00   color rgbt < 0.44, 0.23, 0.09, 0.20> 
                 color rgbt < 0.40, 0.20, 0.08, 0.10>]
}
#declare M_Wood18A = 
colour_map {
    [0.00 0.15   color rgb < 1.0, 0.50, 0.00> 
                 color rgb < 1.0, 0.50, 0.00> *0.5 ]
    [0.15 0.25   color rgb < 1.0, 0.50, 0.00> *0.5 
                 color rgb < 1.0, 0.45, 0.00> *0.7 ]
    [0.25 0.28   color rgb < 1.0, 0.45, 0.00> *0.8 
                 color rgb < 1.0, 0.36, 0.00> *0.3 ]
    [0.28 0.40   color rgb < 1.0, 0.36, 0.00> *0.3 
                 color rgb < 1.0, 0.40, 0.00> *0.4 ]
    [0.40 0.50   color rgb < 1.0, 0.40, 0.00> *0.4 
                 color rgb < 1.0, 0.40, 0.00> *0.6 ]
    [0.50 0.70   color rgb < 1.0, 0.50, 0.00> *0.6 
                 color rgb < 1.0, 0.50, 0.00> *0.7 ]
    [0.70 0.98   color rgb < 1.0, 0.45, 0.00> *0.7 
                 color rgb < 1.0, 0.45, 0.00> *0.5 ]
    [0.98 1.00   color rgb < 1.0, 0.45, 0.00> *0.5 
                 color rgb < 1.0, 0.50, 0.00> ]
}
#declare M_Wood18B = 
colour_map {
    [0.00 0.25   color rgbt < 0.50, 0.26, 0.12, 0.30>
                 color rgbt < 0.54, 0.29, 0.13, 0.40>]
    [0.25 0.40   color rgbt < 0.54, 0.29, 0.13, 0.40>
                 color rgbt < 0.55, 0.28, 0.10, 0.60>]
    [0.40 0.50   color rgbt < 0.55, 0.28, 0.10, 0.60>
                 color rgbt < 0.50, 0.23, 0.15, 1.00>]
    [0.50 0.70   color rgbt < 0.50, 0.23, 0.15, 1.00>  
                 color rgbt < 0.56, 0.29, 0.17, 0.60>]
    [0.70 0.98   color rgbt < 0.56, 0.29, 0.17, 0.60> 
                 color rgbt < 0.54, 0.29, 0.13, 0.40>]
    [0.98 1.00   color rgbt < 0.54, 0.29, 0.13, 0.40> 
                 color rgbt < 0.50, 0.26, 0.12, 0.30>]
}
#declare M_Wood19A =
color_map {
    [0.00 color rgb <0.5, 0.25, 0.125>]
    [0.40 color rgb <1.0, 0.50, 0.250> ]
    [0.60 color rgb <1.0, 0.50, 0.250> ]
    [1.00 color rgb <0.5, 0.25, 0.125>]
}
#declare M_Wood19B =
color_map {
    [0.00 0.30 color rgb <0.35, 0.175, 0.0875> 
               color rgb <1.00, 0.500, 0.2500> ]
    [0.30 1.00 color rgbf 1 color rgbf 1]
}
#version Woodmaps_Inc_Temp;
#end
`,
    'woods.inc': `// This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
// To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
// letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

//    Persistence of Vision Ray Tracer version 3.5 Include File
//    File: woods.inc
//    Last updated: 2001.7.24
//    Description:
/*                         Basic wooden textures

  Credits:
  Textures T_Wood1 through T_Wood30 by Dan Farmer

  Textures T_Wood31 through T_Wood35 contributed by
  Paul Novak, 75274.1613@compuserve.com

  Notes on layered textures T_Wood1 through T_Wood30:

  The pigment definitions:
  ========================
  Declares pigments P_Woodgrain1A through P_Woodgrain19A and
  P_Woodgrain1B through P_Woodgrain19B.  The only difference between the
  "A" designations and the "B" designations is in design.  The "A"'s
  were designed to generally work better as underlying patterns, using
  opaque color_maps,  while the "B" pigments were designed to work
  better as top layers, with some degree of transparency in their
  color_maps.

  The pigments with the "A" and "B" designations are combinations that
  were designed to work well together, but do not neccessarily have to
  be used as pairs.

  These pigment definitions do not have colormaps assigned so
  that they can mix 'n matched in various combinations by the user when
  designing their own colors.  In this file, the color_maps are added at
  the point of defining the final textures.


  The color_map definitions:
  ==========================
  These are declared in the #include file "woodmaps.inc".  They are
  named M_Wood1A through M_Wood19A and M_Wood1B through M_Wood19B.

  There are two types of declarations in woodmaps.inc. The "A" color_maps
  are intended as the 1st layer of multi-layer textures, but many work
  well by themselves, as well.

  The "B" color_maps contain transparent colors and are intended for
  use as top layers to influence the "A" maps.


  The wood textures
  =================
  Here the various P_WoodGrainx textures are combined with color_maps to
  create textures named T_Wood1 through T_Wood30.


  General
  =======
  Wood textures are designed with the major axis of the woodgrain
  "cylinder" aligned along the Z axis.  With the exception of the few
  of the textures below that have a small amount of x-axis rotation
  built-in, the textures below will exhibit a very straight grain
  pattern unless you apply a small amount of x-axis rotation to them
  (generally 2 to 4 degrees seems to work well).
*/

#ifndef(Woods_Inc_Temp)
#declare Woods_Inc_Temp=version;
#version 3.5;

#ifdef(View_POV_Include_Stack)
    #debug "including woods.inc\\n"
#end

#include "woodmaps.inc"


#declare P_WoodGrain1A =
pigment {
    wood
    turbulence 0.04
    octaves 3
    scale <0.05, .05, 1>
}

#declare P_WoodGrain1B =
pigment {
    wood
    turbulence <0.1, 0.5, 1>
    octaves 5
    lambda 3.25
    scale <0.15, .5, 1>
    rotate <5, 10, 5>
    translate -x*2
}

#declare P_WoodGrain2A =
pigment {
    wood
    turbulence 0.04
    octaves 3
    scale <0.15, .15, 1>
}

#declare P_WoodGrain2B =
pigment {
    wood  
    turbulence <0.1, 0.35, 0.1>
    octaves 5
    lambda 3.25
    scale <0.25, .25, 1>
    rotate <5, 10, 5>
    translate -x*2
}

#declare P_WoodGrain3A = 
pigment {
    wood  
    turbulence 0.04
    octaves 3
    scale <0.05, .05, 1>
    rotate <2,2,0>
}

#declare P_WoodGrain3B =
pigment {
    wood  
    turbulence <0.1, 0.5, 1> 
    octaves 5
    lambda 3.25
    scale <0.15, .5, 1>
    rotate <5, 10, 5>
    translate -x*2
}

#declare P_WoodGrain4A = 
pigment {
    wood
    turbulence 0.04
    octaves 4
    omega 1.25
    scale <0.15, .15, 1>
}

#declare P_WoodGrain4B =
pigment {
    bozo
    turbulence <0.03, 0.03, 0.1>
    octaves 5
    lambda 3.25
    scale <0.025, .025, 1.0>
}
#declare P_WoodGrain5A =
pigment {
    wood  
    turbulence <0.04, 0.04, 0.1>
    octaves 4
    omega 1.25
    scale <0.15, .15, 1>
}

#declare P_WoodGrain5B =
pigment {
    wood  
    turbulence <0.025, 0.025, 0.1>
    octaves 4
    omega 1.3
    scale <0.30, .20, 1>
    translate <0.1, 0.1, 0.20>
}


#declare P_WoodGrain6A =
pigment {
    wood 
    turbulence <0.05, 0.08, 1>
    octaves 4
    scale <0.15, .15, 1>
    translate -x*100
}

#declare P_WoodGrain6B =
pigment {
    wood  
    turbulence <0.05, 0.05, 0>
    octaves 4
    omega 0.95
    scale <0.20, 0.20, 1>             
    rotate x*20
}


#declare P_WoodGrain7A =
pigment {
    wood
    turbulence <0.05, 0.08, 1000>
    octaves 4
    scale <0.15, .15, 1>
}

#declare P_WoodGrain7B =
pigment {
    bozo
    scale <0.01, 0.01, 100000>
}


#declare P_WoodGrain8A =
pigment {
    wood
    turbulence 0.04
    octaves 3
    scale <0.05, .05, 1>
}

#declare P_WoodGrain8B =
pigment {
    wood
    turbulence <0.04, 0.04, 1>
    octaves 4
    scale <0.05, 0.05, 1> * 0.66
}


#declare P_WoodGrain9A =
pigment {
    wood  
    turbulence 0.1
    octaves 4
    lambda 3
    scale 0.2
    rotate <0.125, 0.125, 0>
}

#declare P_WoodGrain9B =
pigment {
    wood
    turbulence 0.1          
    octaves 4
    lambda 3.5
    scale 0.2
    rotate <0.125, 0.125, 0>
    translate <0.015, 0.015, 0.015>
}


#declare P_WoodGrain10A =
pigment {
    wood  
    turbulence 0.02
    octaves 4
    lambda 3
    scale 0.175
    rotate <2, 2, 0>
}


#declare P_WoodGrain10B =
pigment {
    wood
    turbulence 0.02
    octaves 4
    lambda 2.8
    scale 0.2
    rotate <2, 2, 0>
    translate <0.0175, 0.0175, 0.0175>
}


#declare P_WoodGrain11A =
pigment {
    wood
    turbulence 0.02
    scale 0.1
    translate <10, 0, 0>
}

#declare P_WoodGrain11B =
pigment {
    wood
    turbulence 0.01
    scale 0.5
    translate <10, 0, 0>
}


#declare P_WoodGrain12A =
pigment {
    bozo
    turbulence 0.04
    lambda 2.5
    omega 0.1
    octaves 7
    scale <0.5, 0.05, 0.05>
}

#declare P_WoodGrain12B =
pigment {
    wood
    turbulence <0.1, 0.04, 1>
    scale <0.15, 0.5, 1>
//    translate <10, 0, 0>
    rotate x*2
}


#declare P_WoodGrain13A =
pigment {
    wood
    turbulence 0.02
    scale 0.1
    translate <10, 0, 0>
}

#declare P_WoodGrain13B =
pigment {
    wood
    turbulence 0.01
    scale 0.05 
//    translate <10, 0, 0>
}


#declare P_WoodGrain14A =
pigment {
    wood
    colour_map { M_Wood14A }
    turbulence 0.065
    octaves 2
    scale <0.15, .15, 1>
    translate < -1 0 0 >
    rotate <-3, -3, 0>
}

#declare P_WoodGrain14B=
pigment {
    wood
    colour_map { M_Wood14B }
    turbulence <0, 0.1, 0>
    lambda 2.75
    omega 1.15
    octaves 4
    scale <5, 0.075, 1>
    rotate x*90
}


#declare P_WoodGrain15A =
pigment {
    bozo
    colour_map { M_Wood15A }
    turbulence 0.04
    scale <0.05 0.05 1>
}


#declare P_WoodGrain15B =
pigment {
    wood
    colour_map { M_Wood15B }
    scale <0.20 0.20 1>
    turbulence 0.04
    rotate <-2, 2, 0>
}


#declare P_WoodGrain16A =
pigment {
    bozo
    colour_map { M_Wood16A }
    turbulence 0.04
    scale <0.02 0.02 1>
}


#declare P_WoodGrain16B =
pigment {
    wood
    colour_map { M_Wood16B }
    scale <0.075 0.075 1>
    turbulence 0.035
    rotate <-2, 2, 0>
}


#declare P_WoodGrain17A = 
pigment {
    wood
    colour_map { M_Wood17A }
    turbulence 0.04
    omega 0.4
    scale <0.1 0.1 1>
    rotate -x*4
}

#declare P_WoodGrain17B =
pigment {
    wood
    colour_map { M_Wood17B }
    turbulence 0.05
    omega 0.65
    scale <0.2 0.2 1>
    rotate -x*2
}

#declare P_WoodGrain18A =
pigment {
    wood
    colour_map { M_Wood18A }
    turbulence 0.02
    octaves 4
    lambda 4
//    scale 0.3
    scale 0.1
    rotate <2, 0, 0>
}


#declare P_WoodGrain18B =
pigment {
    wood
    colour_map { M_Wood18B }
    turbulence 0.02
    octaves 6
    lambda 2.8
    omega 0.6
//    scale 0.1
    scale 0.05
    rotate <2, 0, 0>
}

#declare P_WoodGrain19A =
pigment {
    wood
    scale <0.075, 0.075, 1>
    turbulence 0.065
    omega 0.45
    lambda 2.3
    color_map { M_Wood19A }
    rotate x*4
}
#declare P_WoodGrain19B =
pigment {
    bozo
    color_map { M_Wood19B }
    scale <0.013, 0.013, 0.75>
}



// Natural oak (light)
#declare T_Wood1 =
    texture { pigment { P_WoodGrain1A  color_map { M_Wood1A }}}
    texture { pigment { P_WoodGrain1B  color_map { M_Wood1B }}}

// Dark brown
#declare T_Wood2   =
    texture { pigment { P_WoodGrain2A  color_map { M_Wood2A }}}
    texture { pigment { P_WoodGrain2B  color_map { M_Wood2B }}}

// Bleached oak (white)
#declare T_Wood3   =         
    texture { pigment { P_WoodGrain3A  color_map { M_Wood3A }}} 
    texture { pigment { P_WoodGrain3B  color_map { M_Wood3B }}}

// Mahogany (purplish-red)
#declare T_Wood4   =
    texture { pigment { P_WoodGrain4A  color_map { M_Wood4A }}}
    texture { pigment { P_WoodGrain4B  color_map { M_Wood4B }}}

// Dark yellow with reddish overgrain
#declare T_Wood5   =         
    texture { pigment { P_WoodGrain5A  color_map { M_Wood5A }}} 
    texture { pigment { P_WoodGrain5B  color_map { M_Wood5B }}}

// Cocabola (red)
#declare T_Wood6   =         
    texture { pigment { P_WoodGrain6A  color_map { M_Wood6A }}}
    texture { pigment { P_WoodGrain6B  color_map { M_Wood6B }}}

// Yellow pine (ragged grain)
#declare T_Wood7   =         
    texture { pigment { P_WoodGrain7A  color_map { M_Wood7A }}} 
    texture { pigment { P_WoodGrain7B  color_map { M_Wood7B }}}

// Dark brown. Walnut?    
#declare T_Wood8   =
    texture { pigment { P_WoodGrain8A  color_map { M_Wood8A }}} 
    texture { pigment { P_WoodGrain8B  color_map { M_Wood8B }}}

// Yellowish-brown burl (heavily turbulated)
#declare T_Wood9   =         
    texture { pigment { P_WoodGrain9A  color_map { M_Wood9A }}}
    texture { pigment { P_WoodGrain9B  color_map { M_Wood9B }}}

// Soft pine (light yellow, smooth grain)
#declare T_Wood10 = 
    texture {  pigment{ P_WoodGrain10A color_map { M_Wood10A }}} 
    texture {  pigment{ P_WoodGrain10B color_map { M_Wood10B }}}

// Spruce (yellowish, very straight, fine grain)
#declare T_Wood11 = 
    texture {  pigment{ P_WoodGrain11A color_map { M_Wood11A }}} 
    texture {  pigment{ P_WoodGrain11B color_map { M_Wood11B }}}

// Another very dark brown.  Walnut-stained pine, perhaps?
#declare T_Wood12 = 
    texture {  pigment{ P_WoodGrain12A color_map { M_Wood12A }}} 
    texture {  pigment{ P_WoodGrain12B color_map { M_Wood12B }}}

// Very straight grained, whitish
#declare T_Wood13 = 
    texture {  pigment{ P_WoodGrain13A color_map { M_Wood13A }}}
    texture {  pigment{ P_WoodGrain13B color_map { M_Wood13B }}}

// Red, rough grain
#declare T_Wood14 = 
    texture {  pigment{ P_WoodGrain14A color_map { M_Wood14A }}} 
    texture {  pigment{ P_WoodGrain14B color_map { M_Wood14B }}}

// Medium brown
#declare T_Wood15 =
    texture {  pigment{ P_WoodGrain15A color_map { M_Wood15A }}} 
    texture {  pigment{ P_WoodGrain15B color_map { M_Wood15B }}}

// Medium brown
#declare T_Wood16 = 
    texture {  pigment{ P_WoodGrain16A color_map { M_Wood16A }}} 
    texture {  pigment{ P_WoodGrain16B color_map { M_Wood16B }}}

// Medium brown
#declare T_Wood17 = 
    texture {  pigment{ P_WoodGrain17A color_map { M_Wood17A }}} 
    texture {  pigment{ P_WoodGrain17B color_map { M_Wood17B }}}

// Orange
#declare T_Wood18 =
    texture {  pigment{ P_WoodGrain18A color_map { M_Wood18A }}}
    texture {  pigment{ P_WoodGrain18B color_map { M_Wood18B }}}

// Golden Oak.
//  M_Woods 1,3,7,8,10,14,15,17,18,19 work well, also.
#declare T_Wood19 =
    texture {  pigment{ P_WoodGrain19A color_map { M_Wood19A }}}
    texture {  pigment{ P_WoodGrain19B color_map { M_Wood19B }}}

#declare T_Wood20 =
    texture {  pigment{ P_WoodGrain19A color_map { M_Wood19A }}}
    texture {  pigment{ P_WoodGrain19B color_map { M_Wood19B }}}

#declare T_Wood21 =
    texture {  pigment{ P_WoodGrain1A color_map { M_Wood11A }}}
    texture {  pigment{ P_WoodGrain1B color_map { M_Wood11B }}}

#declare T_Wood22 =
    texture {  pigment{ P_WoodGrain1A color_map { M_Wood12A }}}
    texture {  pigment{ P_WoodGrain1B color_map { M_Wood12B }}}

#declare T_Wood23 =
    texture {  pigment{ P_WoodGrain1A color_map { M_Wood13A }}}
    texture {  pigment{ P_WoodGrain1B color_map { M_Wood13B }}}

#declare T_Wood24 =
    texture {  pigment{ P_WoodGrain1A color_map { M_Wood14A }}}
    texture {  pigment{ P_WoodGrain1B color_map { M_Wood14B }}}

#declare T_Wood25 =
    texture {  pigment{ P_WoodGrain1A color_map { M_Wood15A }}}
    texture {  pigment{ P_WoodGrain1B color_map { M_Wood15B }}}

#declare T_Wood26 =
    texture {  pigment{ P_WoodGrain1A color_map { M_Wood16A }}}
    texture {  pigment{ P_WoodGrain1B color_map { M_Wood16B }}}

#declare T_Wood27 =
    texture {  pigment{ P_WoodGrain1A color_map { M_Wood17A }}}
    texture {  pigment{ P_WoodGrain1B color_map { M_Wood17B }}}

#declare T_Wood28 =
    texture {  pigment{ P_WoodGrain1A color_map { M_Wood18A }}}
    texture {  pigment{ P_WoodGrain1B color_map { M_Wood18B }}}

#declare T_Wood29 =
    texture {  pigment{ P_WoodGrain1A color_map { M_Wood19A }}}
    texture {  pigment{ P_WoodGrain1B color_map { M_Wood19B }}}

#declare T_Wood30 =
    texture {  pigment{ P_WoodGrain1A color_map { M_Wood1A }}}
    texture {  pigment{ P_WoodGrain1B color_map { M_Wood1B }}}

// A light tan wood - heavily grained (variable coloration)
#declare T_Wood31=
texture {
    pigment {
        wood
        turbulence 0.045
        scale 0.125
        color_map {
          [0.10 color rgbt <0.49020, 0.22353, 0.00000, 0.00>]
          [0.16 color rgbt <0.71863, 0.69412, 0.46275, 0.00>]
          [0.20 color rgbt <0.49020, 0.22353, 0.00000, 0.00>]
          [0.25 color rgbt <0.76863, 0.69412, 0.46275, 0.00>]
          [0.32 color rgbt <0.44020, 0.22353, 0.00000, 0.00>]
          [0.37 color rgbt <0.74863, 0.69412, 0.46275, 0.00>]
          [0.40 color rgbt <0.49020, 0.20353, 0.00000, 0.00>]
          [0.45 color rgbt <0.76863, 0.66412, 0.48275, 0.00>]
          [0.51 color rgbt <0.49020, 0.22353, 0.00000, 0.00>]
          [0.55 color rgbt <0.76863, 0.67059, 0.37255, 0.00>]
          [0.61 color rgbt <0.49020, 0.25353, 0.00000, 0.00>]
          [0.65 color rgbt <0.76863, 0.67059, 0.37255, 0.00>]
          [0.70 color rgbt <0.49020, 0.22353, 0.00000, 0.00>]
          [0.75 color rgbt <0.76863, 0.63059, 0.37255, 0.00>]
          [0.82 color rgbt <0.49020, 0.22353, 0.00000, 0.00>]
          [0.88 color rgbt <0.77863, 0.67059, 0.37255, 0.00>]
          [0.91 color rgbt <0.49020, 0.22353, 0.00000, 0.00>]
          [0.95 color rgbt <0.79863, 0.67059, 0.39550, 0.00>]
          [1.00 color rgbt <0.48020, 0.22353, 0.00000, 0.00>]
        }
    }
}



//A rich dark reddish wood, like rosewood, with smooth-flowing grain
#declare T_Wood32=
texture {
    pigment {
        wood turbulence 0.04
        scale 0.15
        color_map {
            [0.15 color rgbt <0.38039, 0.14902, 0.0, 0.0>]
            [0.25 color rgbt <0.23539, 0.00000, 0.0, 0.0>]
            [0.35 color rgbt <0.38139, 0.14912, 0.0, 0.0>]
            [0.45 color rgbt <0.23549, 0.00000, 0.0, 0.0>]
            [0.55 color rgbt <0.38139, 0.14902, 0.0, 0.0>]
            [0.65 color rgbt <0.23559, 0.00000, 0.0, 0.0>]
            [0.75 color rgbt <0.38139, 0.14922, 0.0, 0.0>]
            [0.85 color rgbt <0.23549, 0.00000, 0.0, 0.0>]
            [0.95 color rgbt <0.38039, 0.14902, 0.0, 0.0>]
            [0.90 color rgbt <0.23539, 0.00000, 0.0, 0.0>]
            [1.00 color rgbt <0.38039, 0.14932, 0.0, 0.0>]
        }
    }
}

// Similar to T_WoodB, but brighter
#declare T_Wood33=
texture {
    pigment {
        wood turbulence 0.0425
        scale 0.2
        color_map {
            [0.05 color rgbt <0.55294, 0.21176, 0.00000, 0.0>]
            [0.15 color rgbt <0.32549, 0.13725, 0.00000, 0.0>]
            [0.25 color rgbt <0.55294, 0.21176, 0.00000, 0.0>]
            [0.35 color rgbt <0.32549, 0.11765, 0.00000, 0.0>]
            [0.48 color rgbt <0.55294, 0.21176, 0.00000, 0.0>]
            [0.55 color rgbt <0.29412, 0.13725, 0.01176, 0.0>]
            [0.65 color rgbt <0.55294, 0.21176, 0.00000, 0.0>]
            [0.78 color rgbt <0.32549, 0.13725, 0.00000, 0.0>]
            [0.85 color rgbt <0.55294, 0.21176, 0.00000, 0.0>]
            [0.96 color rgbt <0.28627, 0.13725, 0.00000, 0.0>]
            [1.00 color rgbt <0.54510, 0.17647, 0.03529, 0.0>]
        }
        translate <.015, 0, 0>
    }
}

// Reddish-orange, large, smooth grain.
#declare T_Wood34 =
texture { T_Wood32 }                  // opaque under-layer
texture  {
    pigment {
        onion
        turbulence 0.2125
        colour_map {
            [0.225 colour rgbt <1.000000, 0.53333, 0.11767, 0.4875>]
            [0.350 colour rgbt <0.662750, 0.28617, 0.00001, 0.7250>]
            [0.500 colour rgbt <1.000100, 0.53333, 0.11765, 0.5745>]
            [0.625 colour rgbt <0.662775, 0.28627, 0.00005, 0.6875>]
            [0.750 colour rgbt <1.000200, 0.53333, 0.11755, 0.5275>]
            [0.875 colour rgbt <0.662755, 0.28629, 0.00001, 0.3795>]
            [1.000 colour rgbt <1.000000, 0.53333, 0.11665, 0.6165>]
        }
        scale <0.225, 0.20, 1.15>
    }
}


// Orangish, with a grain more like a veneer than a plank
#declare T_Wood35=
texture {
    pigment {
        wood
        turbulence 0.03725
        omega 0.65725
        lambda 2.425
        color_map {
            [0.250 color rgbt <1.00000, 0.53373, 0.11665, 0.000>]
            [0.350 color rgbt <0.66275, 0.28607, 0.00000, 0.000>]
            [0.525 color rgbt <1.00000, 0.53363, 0.11715, 0.000>]
            [0.600 color rgbt <0.66475, 0.28647, 0.00000, 0.000>]
            [0.750 color rgbt <1.00000, 0.53353, 0.11565, 0.000>]
            [0.850 color rgbt <0.66275, 0.28667, 0.00000, 0.000>]
            [1.000 color rgbt <1.00000, 0.53143, 0.11795, 0.000>]
        }
        scale <0.25, 0.225, 1.0>
    }
}
texture {
    pigment {
        wood
        scale 1.01275
        turbulence 0.0435
        omega 0.65
        lambda 3.15
        color_map {
            [0.200 color rgbt <0.56695, 0.17347, 0.00000, 0.8250>]
            [0.350 color rgbt <0.96471, 0.54510, 0.22753, 0.7710>]
            [0.400 color rgbt <0.56341, 0.17547, 0.00000, 0.9150>]
            [0.615 color rgbt <0.96472, 0.54510, 0.22553, 0.7590>]
            [0.700 color rgbt <0.56671, 0.17687, 0.00000, 0.7920>]
            [0.850 color rgbt <0.96485, 0.54510, 0.22453, 0.8975>]
            [1.000 color rgbt <0.56478, 0.17247, 0.00000, 0.9750>]
        }
        scale <0.225, 0.2725, 1.0>
        translate <-0.35, 0.095, 1.25>
    }
}

#version Woods_Inc_Temp;
#end
`
};
