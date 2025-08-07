const Organization = require('../models/Organization');
const User = require('../models/User');

// Create a new organization and assign first admin
exports.createOrganization = async (req, res) => {
  try {
    const { name, domain, adminName, adminEmail, adminPassword } = req.body;

    const existingOrg = await Organization.findOne({ domain });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization with this domain already exists' });
    }

    const organization = await Organization.create({
      name,
      domain,
      createdBy: req.user._id,
    });

    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      organization: organization._id,
      isVerified: true
    });

    await adminUser.save();

    organization.users.push(adminUser._id);
    await organization.save();

    res.status(201).json({
      message: 'Organization and admin created successfully',
      organization,
      adminUser
    });
  } catch (error) {
    console.error('CREATE ORG ERROR:', error);
    res.status(500).json({ message: 'Failed to create organization' });
  }
};

// List all organizations with their users
exports.getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find()
      .populate('users', 'name email role');
    res.json(organizations);
  } catch (error) {
    console.error('GET ORGS ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch organizations' });
  }
};

// Delete organization
exports.deleteOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    await User.deleteMany({ organization: org._id });
    await org.deleteOne();

    res.json({ message: 'Organization and related users deleted successfully' });
  } catch (error) {
    console.error('DELETE ORG ERROR:', error);
    res.status(500).json({ message: 'Failed to delete organization' });
  }
};
