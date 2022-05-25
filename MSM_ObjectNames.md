# Media Subscription Mediator #
## Object Names ##
There are several related terms that I use consistently when talking and writing about the Media Subscription Mediator distributed application.

The first term is “façade”, and it refers to ERC 1538-compliant contract that contains references to the functions that constituent the application. Various writings about this kind of object have referred to it as a “proxy” or a “router”. But those are ill-defined ad hoc terms.

I have chosen instead to consult the Gang of Four and their seminal book on design patterns, the closest thing we have to a standard for this subject area. The GoF have a pattern named “proxy”, but it is clear from both their description and their example that it is not the appropriate name here. 

Rather they list a “façade” pattern, and it is equally clear from their work that it is the name and the pattern appropriate for the MSM. Accordingly, it is the name I have chosen.

The GoF do not even list a “router” pattern. 

The other two terms, “delegated functions” and “delegate contract”, are, as their names suggest, closely related. Delegated functions are just plain old Solidity functions that have been made known to the façade and are invoked by calls to the façade as if they were functions native to it. 

But they are not native to the façade; instead they are domiciled in delegate contracts, which are just plain old Solidity contracts that adhere to all of the rules for such contracts. They become delegate contracts when their functions are made known to the façade by a utility script, at which point those functions, too, become delegated functions. 

The change from plain old to delegated is one of designation only; there is no difference between plain old contracts and their functions and delegate contracts and their delegated functions. 

----------


Design Patters: Elements of Reusable Object-Oriented Software, Erich Gamma et al . . .
1995 Addison-Wesley	ISBN 021633612
